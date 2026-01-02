import * as z from "zod";
import { tool } from "langchain";
import { loadNotes, saveNote } from "./notesRepo.js";

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
        const note = await saveNote(input.title, input.content);
        return `Saved note ${note.id} (${note.title}) at ${note.createdAt}`;
    },
    {
        name: "save_note",
        description:
            "Save a personal note. Use this when the user asks you to remember something.",
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

export const tools = [getCurrentTimeTool, saveNoteTool, listNotesTool];
