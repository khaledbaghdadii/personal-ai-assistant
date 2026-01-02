import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { config } from "../../config/index.js";
import type { Note } from "../../types/index.js";
import { notesRepo } from "../notes/repository.js";

class VectorStoreService {
    private store: MemoryVectorStore | null = null;
    private embeddings: OpenAIEmbeddings;

    constructor() {
        this.embeddings = new OpenAIEmbeddings({
            model: config.openai.embeddingModel,
        });
    }

    private noteToDocument(note: Note): Document {
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

    async initialize(): Promise<void> {
        const notes = await notesRepo.loadNotes();

        if (notes.length === 0) {
            this.store = new MemoryVectorStore(this.embeddings);
            console.log("✓ Initialized empty vector store");
            return;
        }

        const documents = notes.map(this.noteToDocument);
        this.store = await MemoryVectorStore.fromDocuments(documents, this.embeddings);
        console.log(`✓ Initialized vector store with ${notes.length} note(s)`);
    }

    async addNote(note: Note): Promise<void> {
        if (!this.store) {
            throw new Error("Vector store not initialized");
        }
        const document = this.noteToDocument(note);
        await this.store.addDocuments([document]);
    }

    async search(query: string, k: number = config.vectorStore.searchK): Promise<string> {
        if (!this.store) {
            throw new Error("Vector store not initialized");
        }

        const limitedK = Math.min(k, config.vectorStore.maxK);
        const results = await this.store.similaritySearch(query, limitedK);

        if (results.length === 0) {
            return "No relevant notes found.";
        }

        return results
            .map((doc, index) => {
                const { id, title, createdAt } = doc.metadata;
                return [
                    `${index + 1}. [ID: ${id} | ${title} | ${createdAt}]`,
                    doc.pageContent,
                    "",
                ].join("\n");
            })
            .join("\n");
    }
}

export const vectorStore = new VectorStoreService();
