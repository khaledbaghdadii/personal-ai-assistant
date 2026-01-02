import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { config } from "../config/index.js";
import { tools } from "./tools/index.js";

export const createPlannerAgent = () => {
    const model = new ChatOpenAI({
        model: config.openai.modelName,
        temperature: config.openai.temperature
    });

    const checkpointer = new MemorySaver();

    const systemPrompt = [
        "You are a helpful Personal Ops Assistant.",
        "Use tools when needed.",
        "If the user asks for the current time/date, call get_current_time.",
        "You have tools to save and list personal notes.",
        "Important: Search notes when asked about past context.",
        "When answering from notes, cite source (title/date).",
        "Do not save secrets."
    ].join("\n");

    return createAgent({
        model,
        tools,
        systemPrompt,
        checkpointer,
    });
};
