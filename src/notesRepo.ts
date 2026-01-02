import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

export type Note = {
    id: string;
    createdAt: string;
    title: string;
    content: string;
};

const NOTES_PATH = path.join(process.cwd(), "data", "notes.json");

async function ensureDataDir() {
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
}

export async function loadNotes(): Promise<Note[]> {
    await ensureDataDir();
    try {
        const raw = await fs.readFile(NOTES_PATH, "utf-8");
        return JSON.parse(raw) as Note[];
    } catch {
        return [];
    }
}



export async function saveNote(title: string, content: string): Promise<Note> {
    const notes = await loadNotes();
    const note: Note = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        title,
        content,
    };
    notes.unshift(note);
    await fs.writeFile(NOTES_PATH, JSON.stringify(notes, null, 2), "utf-8");
    return note;
}
