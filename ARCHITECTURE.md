# AI Planner Architecture

This document provides a high-level overview of the system. For detailed developer guides, please refer to the specific component documentation:

- 📘 **[Backend Architecture](apps/api/ARCHITECTURE.md)** (Express, LangChain, Data)
- 📙 **[Frontend Architecture](apps/web/ARCHITECTURE.md)** (Angular, Signals, Material)

## 🏗 High-Level Diagram

The application follows a **Full-Stack Monorepo** pattern:

```mermaid
graph TD
    User[User] --> Frontend[Apps/Web (Angular 18)]
    Frontend --> API[Apps/API (Express)]
    API --> Agent[AI Agent (LangChain)]
    API --> VectorStore[Vector Store Service]
    
    subgraph Backend
        API
        Agent
        VectorStore
        NotesRepo[Notes Repository]
    end

    subgraph Data
        NotesRepo --> FileSystem[JSON Storage]
        VectorStore --> Memory[MemoryVectorStore]
    end
```

## 🧩 Core Decisions

1.  **Monorepo**: Keeps frontend and backend in sync.
2.  **Stateless Agent**: Agent is invoked per request; session state is managed via `thread_id` and in-memory checkpointer (for now).
3.  **In-Memory Vector Search**: Optimized for speed and simplicity for personal use cases (<5000 notes).
4.  **Angular Signals**: Used exclusively for UI state management to ensure performance and reactivity.

## 🚀 Future Roadmap

1.  **Shared Library**: Extract types to `libs/shared-types`.
2.  **Database**: Migrate JSON to SQLite/Postgres.
3.  **Deployment**: Dockerize the stack.
