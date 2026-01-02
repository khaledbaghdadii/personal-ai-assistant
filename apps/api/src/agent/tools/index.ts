import * as z from "zod";
import { tool } from "langchain";
import { notesRepo } from "../../lib/notes/repository.js";
import { vectorStore } from "../../lib/vector/store.js";

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
        // Security check
        const sensitiveKeywords = ["password", "private key", "seed phrase", "api key", "secret key"];
        const combined = `${input.title} ${input.content}`.toLowerCase();

        if (sensitiveKeywords.some(k => combined.includes(k))) {
            return `⚠️ Security Warning: Cannot save content containing sensitive keywords.`;
        }

        const note = await notesRepo.saveNote(input.title, input.content);
        await vectorStore.addNote(note);

        return `Saved note ${note.id} (${note.title}) at ${note.createdAt}`;
    },
    {
        name: "save_note",
        description: "Save a personal note. Do NOT use for secrets.",
        schema: z.object({
            title: z.string().min(1),
            content: z.string().min(1),
        }),
    }
);

const listNotesTool = tool(
    async () => {
        const notes = await notesRepo.loadNotes();
        if (notes.length === 0) return "No notes saved yet.";
        return notes
            .slice(0, 10)
            .map((n) => `- [${n.createdAt}] ${n.title}: ${n.content}`)
            .join("\n");
    },
    {
        name: "list_notes",
        description: "List the most recent saved notes (up to 10).",
        schema: z.object({}),
    }
);

const searchNotesTool = tool(
    async (input: { query: string; k?: number }) => {
        return await vectorStore.search(input.query, input.k);
    },
    {
        name: "search_notes",
        description: "Search for notes semantically similar to a query.",
        schema: z.object({
            query: z.string().min(1),
            k: z.number().optional(),
        }),
    }
);

export const tools = [getCurrentTimeTool, saveNoteTool, listNotesTool, searchNotesTool];
