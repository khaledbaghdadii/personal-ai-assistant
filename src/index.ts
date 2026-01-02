import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { tools } from "./tools.js";

async function main() {
    const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });

    const systemPrompt = [
        "You are a helpful Personal Ops Assistant.",
        "Use tools when needed.",
        "If the user asks for the current time/date, call get_current_time.",
        "You have tools to save and list personal notes.",
        "When the user says 'remember' or gives a preference, consider saving a note.",
        "Do not save secrets like passwords or private keys.",
    ].join("\n");

    const agent = createAgent({
        model,
        tools,
        systemPrompt,
    });

    const result = await agent.invoke({
        messages: [{ role: "user", content: "Remember that I want to run 10k under 1 hour. Also list my notes." }],
    });

    console.log(result.messages[result.messages.length - 1]?.content || "No response");
}

main().catch(console.error);
