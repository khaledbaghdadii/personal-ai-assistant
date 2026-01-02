import path from "node:path";

export const config = {
    paths: {
        dataDir: path.join(process.cwd(), "data"),
        notesFile: path.join(process.cwd(), "data", "notes.json"),
    },
    openai: {
        modelName: "gpt-4o-mini",
        embeddingModel: "text-embedding-3-small",
        temperature: 0.2,
    },
    vectorStore: {
        searchK: 4,
        maxK: 10,
    }
};
