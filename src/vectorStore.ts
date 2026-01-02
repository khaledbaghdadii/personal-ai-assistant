import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { loadNotes, type Note } from "./notesRepo.js";

let vectorStore: MemoryVectorStore | null = null;

/**
 * Convert a note to a LangChain Document with embedded text and metadata
 */
function noteToDocument(note: Note): Document {
    const pageContent = `${note.title}\n\n${note.content}`;
    return new Document({
        pageContent,
        metadata: {
            id: note.id,
            title: note.title,
            createdAt: note.createdAt,
        },
    });
}

/**
 * Initialize the vector store from all existing notes.
 * Call this on app startup.
 */
export async function initializeVectorStore(): Promise<void> {
    const notes = await loadNotes();
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    });

    if (notes.length === 0) {
        // Create empty vector store
        vectorStore = new MemoryVectorStore(embeddings);
        console.log("✓ Initialized empty vector store (no notes found)");
        return;
    }

    const documents = notes.map(noteToDocument);
    vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
    console.log(`✓ Initialized vector store with ${notes.length} note(s)`);
}

/**
 * Add a single note to the existing vector store (incremental update).
 * Call this after saving a new note.
 */
export async function addNoteToVectorStore(note: Note): Promise<void> {
    if (!vectorStore) {
        throw new Error("Vector store not initialized. Call initializeVectorStore() first.");
    }

    const document = noteToDocument(note);
    await vectorStore.addDocuments([document]);
    console.log(`✓ Added note ${note.id} to vector store`);
}

/**
 * Search for notes semantically similar to the query.
 * @param query - The search query
 * @param k - Number of results to return (default 4, max 10)
 * @returns Formatted string with search results
 */
export async function searchNotes(query: string, k: number = 4): Promise<string> {
    if (!vectorStore) {
        throw new Error("Vector store not initialized. Call initializeVectorStore() first.");
    }

    // Clamp k to max 10
    const limitedK = Math.min(k, 10);

    const results = await vectorStore.similaritySearch(query, limitedK);

    if (results.length === 0) {
        return "No relevant notes found.";
    }

    // Format results with source markers
    const formatted = results
        .map((doc: Document, index: number) => {
            const { id, title, createdAt } = doc.metadata;
            return [
                `${index + 1}. [ID: ${id} | ${title} | ${createdAt}]`,
                doc.pageContent,
                "", // Empty line between results
            ].join("\n");
        })
        .join("\n");

    return formatted.trim();
}

/**
 * Get the current vector store instance (for debugging/testing)
 */
export function getVectorStore(): MemoryVectorStore | null {
    return vectorStore;
}
