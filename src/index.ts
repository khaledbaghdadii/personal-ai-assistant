import "dotenv/config";
import * as readline from "node:readline";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { tools } from "./tools.js";
import { initializeVectorStore, searchNotes, addNoteToVectorStore } from "./vectorStore.js";
import { loadNotes, saveNote } from "./notesRepo.js";
import { HumanMessage } from "@langchain/core/messages";

// Configuration
let sessionId = "default";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Helper to ask questions
function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

// Command Handlers
async function handleHelp() {
    console.log(`
Available Commands:
  /help                  Show this help message
  /exit                  Exit the program
  /notes                 List top 10 latest notes
  /save <title> | <txt>  Save a note immediately (split title and content with |)
  /search <query>        Semantic search for notes
  /newsession [name]     Start a new chat session (resets conversation memory)
    `);
}

async function handleNotes() {
    try {
        const notes = await loadNotes();
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
}

async function handleSave(args: string) {
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
    const content = contentParts.join("|"); // Rejoin if multiple pipes

    try {
        const note = await saveNote(title, content);
        await addNoteToVectorStore(note);
        console.log(`✓ Saved note: "${note.title}"`);
    } catch (error) {
        console.error("Error saving note:", error);
    }
}

async function handleSearch(query: string) {
    if (!query) {
        console.log("Usage: /search <query>");
        return;
    }
    try {
        console.log(`Searching for: "${query}"...`);
        const results = await searchNotes(query, 4);
        console.log("\nSearch Results:");
        console.log(results);
        console.log("");
    } catch (error) {
        console.error("Error searching notes:", error);
    }
}

async function handleNewSession(name: string) {
    sessionId = name || `session-${Date.now()}`;
    console.log(`✓ Switched to session: ${sessionId}`);
}

// Main Loop
async function main() {
    console.log("Initializing...");
    try {
        await initializeVectorStore();
    } catch (error) {
        console.error("Warning: Failed to initialize vector store. Search may not work.", error);
    }

    const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
    const checkpointer = new MemorySaver();

    const systemPrompt = [
        "You are a helpful Personal Ops Assistant.",
        "Use tools when needed.",
        "If the user asks for the current time/date, call get_current_time.",
        "You have tools to save and list personal notes.",
        "When the user says 'remember' or gives a preference, consider saving a note.",
        "Do not save secrets like passwords or private keys.",
        "",
        "IMPORTANT: Use search_notes when the user asks about:",
        "- Past notes, goals, or preferences",
        "- 'What did I say about...'",
        "- 'Remind me about...'",
        "- Any information they might have mentioned before",
        "",
        "When answering from retrieved notes:",
        "- Reference the source (title and date)",
        "- Do not hallucinate information not in the notes",
        "",
        "If the user says 'remember this' but content is unclear, ask a clarifying question.",
    ].join("\n");

    const agent = createAgent({
        model,
        tools,
        systemPrompt,
        checkpointer: checkpointer, // Correct parameter name
    });

    console.log("\n🤖 AI Planner Ready! Type /help for commands.");
    console.log(`Current Session: ${sessionId}`);

    while (true) {
        const input = await askQuestion(`\n[${sessionId}] > `);
        const trimmed = input.trim();

        if (!trimmed) continue;

        if (trimmed.startsWith("/")) {
            // Command Handling
            const cmdParts = trimmed.split(" ");
            const cmd = cmdParts[0].toLowerCase();
            const args = cmdParts.slice(1).join(" ");

            switch (cmd) {
                case "/help":
                    await handleHelp();
                    break;
                case "/exit":
                    console.log("Goodbye!");
                    rl.close();
                    return;
                case "/notes":
                    await handleNotes();
                    break;
                case "/save":
                    await handleSave(args);
                    break;
                case "/search":
                    await handleSearch(args);
                    break;
                case "/newsession":
                    await handleNewSession(args);
                    break;
                default:
                    console.log(`Unknown command: ${cmd}. Type /help for available commands.`);
            }
        } else {
            // Agent Interaction
            try {
                const result = await agent.invoke(
                    {
                        messages: [new HumanMessage(trimmed)],
                    },
                    {
                        configurable: { thread_id: sessionId },
                    }
                );

                const lastMessage = result.messages[result.messages.length - 1];
                const response = lastMessage?.content;
                console.log("\nAI:", typeof response === 'string' ? response : "No response");
            } catch (error) {
                console.error("\nError calling agent:", error);
            }
        }
    }
}

main().catch(console.error);
