# Technical Architecture & Design Decisions

This document outlines the architecture, component breakdown, and key design decisions for the AI Planner application.

## 🏗 High-Level Architecture

The application follows a **Modular Monolith** pattern, separating concerns into distinct layers:

```mermaid
graph TD
    User[User / CLI] --> REPL[src/cli/repl.ts]
    REPL --> Router[Command Router]
    REPL --> Agent[AI Agent (LangChain)]
    
    subgraph Core Logic
        Router --> Cmds[src/cli/commands.ts]
        Agent --> Tools[src/agent/tools]
    end
    
    subgraph Data Layer
        Cmds --> NotesRepo[Notes Repository]
        Cmds --> VectorStore[Vector Store Service]
        Tools --> NotesRepo
        Tools --> VectorStore
    end
    
    NotesRepo --> FS[File System (JSON)]
    VectorStore --> Memory[MemoryVectorStore]
    VectorStore --> OpenAI[OpenAI Embeddings]
```

## 🧩 Component Breakdown

### 1. **CLI Layer (`src/cli/`)**
- **Responsibility**: Handles user input, manages the event loop, and routes requests.
- **Why `readline`?**: We chose the native Node.js `readline` module over heavy libraries like `inquirer` or `commander` to keep the app lightweight and maintain full control over the input stream for the custom REPL experience.

### 2. **Agent Layer (`src/agent/`)**
- **Responsibility**: Configures the LangChain agent, system prompts, and tools.
- **Decision: `createAgent` vs `AgentExecutor`**: We use the newer `createAgent` (drawing from LangGraph concepts) which offers better state management and extensibility compared to the legacy `AgentExecutor`.
- **Memory**: Uses `MemorySaver` for in-memory session persistence. We chose this for simplicity in a CLI context. For a distributed app, we would switch to Redis or Postgres.

### 3. **Data Layer (`src/lib/`)**
- **Notes Repository (`src/lib/notes/`)**: 
  - Uses simple JSON file storage (`data/notes.json`).
  - **Why JSON?**: Zero-dependency, human-readable, and easy to backup/version control for a personal tool.
  
- **Vector Store (`src/lib/vector/`)**:
  - Implements RAG (Retrieval-Augmented Generation).
  - **Why `MemoryVectorStore`?**: Since the dataset is small (<1000 notes), an in-memory vector store that rebuilds on startup is extremely fast and avoids the complexity of setting up extensive infrastructure like Pinecone or Weaviate.
  - **Why OpenAI Embeddings?**: Reliable, high-quality semantic understanding (`text-embedding-3-small` is efficient and cheap).

### 4. **Configuration (`src/config/`)**
- **Responsibility**: Centralizes env vars and constants.
- **Benefit**: Makes testing and refactoring safer by removing hardcoded strings.

## 💡 Key Design Decisions

### **In-Memory Vector Search vs. Persistent Vector DB**
- **Choice**: In-Memory (rebuilt on startup).
- **Reasoning**: Personal notes usually fit in memory. Rebuilding the index from 100 notes takes milliseconds. Adding a persistent vector DB (like Chroma or SQLite-vss) allows scale but adds significant operational complexity (installing binaries, managing connections). For a "Day 1" CLI, the in-memory approach is the pragmatic winner.

### **Manual Command Routing vs. LLM-only**
- **Choice**: Hybrid. Slash commands (`/save`, `/search`) run deterministic code; other input goes to LLM.
- **Reasoning**: 
  - **Speed**: `/search` should be instant and raw.
  - **Reliability**: `/save` should exactly save what I type, not what the LLM *interprets* I want to save.
  - **Cost**: Saves tokens.

### **Typescript & Strict Mode**
- **Choice**: Enabled.
- **Reasoning**: Essential for robust refactoring and preventing runtime errors in the agent logic.

## 🚀 Future Improvements

To scale this to a production SaaS, we would:
1.  **Database**: Migrate JSON -> PostgreSQL (with `pgvector`).
2.  **Memory**: Migrate MemorySaver -> RedisCheckpointSaver.
3.  **API**: Wrap the core logic in Fastify/Express endpoints.
