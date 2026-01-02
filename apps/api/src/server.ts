import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { notesRepo } from "./lib/notes/repository.js";
import { vectorStore } from "./lib/vector/store.js";
import { createPlannerAgent } from "./agent/index.js";
import { HumanMessage } from "@langchain/core/messages";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize Services
(async () => {
    try {
        await vectorStore.initialize();
        console.log("✓ Vector Store Initialized");
    } catch (e) {
        console.error("Failed to init vector store", e);
    }
})();

// Agent Factory (Stateless wrapper for now, or per-session)
// We'll create one agent instance per request or cache them.
// For MemorySaver to work with session IDs, we can reuse the same agent instance 
// IF the checkpointer handles thread_id isolation well. 
// MemorySaver is in-memory Map, so one agent instance sharing the checkpointer is fine.
const agent = createPlannerAgent();

// Routes

app.get("/api/notes", async (req, res) => {
    try {
        const notes = await notesRepo.loadNotes();
        res.json(notes);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.post("/api/notes", async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Missing title or content" });
    }
    try {
        const note = await notesRepo.saveNote(title, content);
        await vectorStore.addNote(note);
        res.json(note);
    } catch (e) {
        res.status(500).json({ error: "Failed to save note" });
    }
});

app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "Missing query" });
    try {
        const results = await vectorStore.search(query);
        // Parse the string result back to JSON or just return string 
        // Our vectorStore.search returns a string format. 
        // For API, better to have a raw method? For now return text.
        res.json({ result: results });
    } catch (e) {
        res.status(500).json({ error: "Search failed" });
    }
});

app.post("/api/chat", async (req, res) => {
    const { message, sessionId } = req.body;
    const threadId = sessionId || "default";

    try {
        const result = await agent.invoke(
            { messages: [new HumanMessage(message)] },
            { configurable: { thread_id: threadId } }
        );
        const lastMsg = result.messages[result.messages.length - 1];
        res.json({
            response: lastMsg?.content || "No response",
            sessionId: threadId
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Agent failed" });
    }
});

app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});
