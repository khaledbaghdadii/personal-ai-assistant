import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "../../config/index.js";
import type { Note } from "../../types/index.js";

async function ensureDataDir() {
    await fs.mkdir(config.paths.dataDir, { recursive: true });
}

export class NotesRepository {
    async loadNotes(): Promise<Note[]> {
        await ensureDataDir();
        try {
            const raw = await fs.readFile(config.paths.notesFile, "utf-8");
            return JSON.parse(raw) as Note[];
        } catch {
            return [];
        }
    }

    async saveNote(title: string, content: string): Promise<Note> {
        const notes = await this.loadNotes();
        const note: Note = {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            title,
            content,
        };
        notes.unshift(note);
        await fs.writeFile(config.paths.notesFile, JSON.stringify(notes, null, 2), "utf-8");
        return note;
    }
}

export const notesRepo = new NotesRepository();
