import { notesRepo } from "../lib/notes/repository.js";
import { vectorStore } from "../lib/vector/store.js";

export const commands = {
    help: async () => {
        console.log(`
Available Commands:
  /help                  Show this help message
  /exit                  Exit the program
  /notes                 List top 10 latest notes
  /save <title> | <txt>  Save a note immediately
  /search <query>        Semantic search for notes
  /newsession [name]     Start a new chat session
        `);
    },

    notes: async () => {
        try {
            const notes = await notesRepo.loadNotes();
            if (notes.length === 0) {
                console.log("No notes saved yet.");
                return;
            }
            console.log("\nRecent Notes:");
            notes.slice(0, 10).forEach((n, i) => {
                console.log(`${i + 1}. [${n.createdAt}] ${n.title}`);
            });
            console.log("");
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    },

    save: async (args: string) => {
        const parts = args.split("|").map((s) => s.trim());
        if (parts.length < 2) {
            console.log("Usage: /save <title> | <content>");
            return;
        }
        const [title, ...contentParts] = parts;
        if (!title) {
            console.log("Error: Title cannot be empty.");
            return;
        }
        const content = contentParts.join("|");

        try {
            const note = await notesRepo.saveNote(title, content);
            await vectorStore.addNote(note);
            console.log(`✓ Saved note: "${note.title}"`);
        } catch (error) {
            console.error("Error saving note:", error);
        }
    },

    search: async (args: string) => {
        if (!args) {
            console.log("Usage: /search <query>");
            return;
        }
        try {
            console.log(`Searching for: "${args}"...`);
            const results = await vectorStore.search(args);
            console.log("\nSearch Results:");
            console.log(results);
            console.log("");
        } catch (error) {
            console.error("Error searching notes:", error);
        }
    },
};
