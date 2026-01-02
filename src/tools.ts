import * as z from "zod";
import { tool } from "langchain";
import { loadNotes, saveNote } from "./notesRepo.js";
import { searchNotes, addNoteToVectorStore } from "./vectorStore.js";

const getCurrentTimeTool = tool(
    async () => new Date().toISOString(),
    {
        name: "get_current_time",
        description: "Get the current time as an ISO string.",
        schema: z.object({}),
    }
);


const saveNoteTool = tool(
    async (input: { title: string; content: string }) => {
        // Security check: prevent storing sensitive information
        const sensitiveKeywords = [
            "password",
            "private key",
            "seed phrase",
            "api key",
            "secret key",
            "token",
            "credential",
        ];

        const combinedText = `${input.title} ${input.content}`.toLowerCase();
        const foundSensitive = sensitiveKeywords.find(keyword =>
            combinedText.includes(keyword)
        );

        if (foundSensitive) {
            return `⚠️ Security Warning: Cannot save notes containing sensitive information like "${foundSensitive}". Please remove sensitive data and try again.`;
        }

        const note = await saveNote(input.title, input.content);

        // Add to vector store for immediate searchability
        await addNoteToVectorStore(note);

        return `Saved note ${note.id} (${note.title}) at ${note.createdAt}`;
    },
    {
        name: "save_note",
        description:
            "Save a personal note. Use this when the user asks you to remember something. DO NOT use this for passwords, private keys, or other secrets.",
        schema: z.object({
            title: z.string().min(1),
            content: z.string().min(1),
        }),
    }
);

const listNotesTool = tool(async () => {
    const notes = await loadNotes();
    if (notes.length === 0) return "No notes saved yet.";
    return notes
        .slice(0, 10)
        .map((n) => `- [${n.createdAt}] ${n.title}: ${n.content}`)
        .join("\n");
}, {
    name: "list_notes",
    description: "List the most recent saved notes (up to 10).",
    schema: z.object({}),
});

const searchNotesTool = tool(
    async (input: { query: string; k?: number }) => {
        const k = input.k ?? 4;
        return await searchNotes(input.query, k);
    },
    {
        name: "search_notes",
        description:
            "Search for notes semantically similar to a query. Use this when the user asks about past notes, goals, preferences, or anything they might have mentioned before. Returns notes with source information (ID, title, date).",
        schema: z.object({
            query: z.string().min(1).describe("The search query"),
            k: z.number().int().min(1).max(10).optional().describe("Number of results to return (default 4, max 10)"),
        }),
    }
);

export const tools = [getCurrentTimeTool, saveNoteTool, listNotesTool, searchNotesTool];
