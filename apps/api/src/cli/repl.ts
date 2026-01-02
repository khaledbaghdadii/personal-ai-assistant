import * as readline from "node:readline";
import { HumanMessage } from "@langchain/core/messages";
import { commands } from "./commands.js";
import { createPlannerAgent } from "../agent/index.js";
import { vectorStore } from "../lib/vector/store.js";

export class CLI {
    private rl: readline.Interface;
    private sessionId: string;
    private agent: any; // Type inference for now, or compiled graph type

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.sessionId = "default";
        this.agent = createPlannerAgent();
    }

    private ask(query: string): Promise<string> {
        return new Promise((resolve) => this.rl.question(query, resolve));
    }

    async start() {
        console.log("Initializing vector store...");
        try {
            await vectorStore.initialize();
        } catch (error) {
            console.error("Warning: Vector store init failed.", error);
        }

        console.log("\n🤖 AI Planner Ready! Type /help for commands.");
        console.log(`Current Session: ${this.sessionId}`);

        while (true) {
            const input = await this.ask(`\n[${this.sessionId}] > `);
            const trimmed = input.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith("/")) {
                await this.handleCommand(trimmed);
            } else {
                await this.handleAgentInteraction(trimmed);
            }
        }
    }

    private async handleCommand(input: string) {
        const cmdParts = input.split(" ");
        const cmd = cmdParts[0].toLowerCase().slice(1); // remove /
        const args = cmdParts.slice(1).join(" ");

        switch (cmd) {
            case "help":
                await commands.help();
                break;
            case "exit":
                console.log("Goodbye!");
                this.rl.close();
                process.exit(0);
            case "notes":
                await commands.notes();
                break;
            case "save":
                await commands.save(args);
                break;
            case "search":
                await commands.search(args);
                break;
            case "newsession":
                this.sessionId = args || `session-${Date.now()}`;
                console.log(`✓ Switched to session: ${this.sessionId}`);
                break;
            default:
                console.log(`Unknown command: /${cmd}. Type /help.`);
        }
    }

    private async handleAgentInteraction(input: string) {
        try {
            const result = await this.agent.invoke(
                { messages: [new HumanMessage(input)] },
                { configurable: { thread_id: this.sessionId } }
            );

            const lastMsg = result.messages[result.messages.length - 1];
            const response = lastMsg?.content;
            console.log("\nAI:", typeof response === "string" ? response : "No response");
        } catch (error) {
            console.error("\nError calling agent:", error);
        }
    }
}
