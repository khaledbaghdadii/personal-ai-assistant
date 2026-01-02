# Technical Architecture & Design Decisions

This document outlines the architecture, component breakdown, and key design decisions for the AI Planner application.

## 🏗 High-Level Architecture

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

## 🧩 Component Breakdown

### 1. **Frontend (`apps/web`)**
- **Framework**: Angular 18 (Standalone Components).
- **State Management**: Angular Signals (Native).
- **UI Library**: Angular Material & TailwindCSS.
- **Responsibility**: Handles user interaction, chat history display, and notes management UI.

### 2. **Backend (`apps/api`)**
- **Framework**: Express.js.
- **Responsibility**: Exposes REST endpoints (`/api/chat`, `/api/notes`, `/api/search`).
- **Agent Layer**: Wraps LangChain logic. Stateless handlers invoke the agent per request (or manage session persistence).
- **Security**: Validates input for secrets before saving.

### 3. **Data Layer (`data/`)**
- **Persistence**: `apps/api/data/notes.json` (Single source of truth).
- **Vector Index**: In-memory `MemoryVectorStore` rebuilt on startup from the JSON file.

## 💡 Key Design Decisions

### **Monorepo Structure**
- **Choice**: `apps/api` + `apps/web`.
- **Reasoning**: Clear separation of concerns while keeping the codebase unified. Allows sharing types easily in the future (though currently duplicated or separate).

### **Angular Signals**
- **Choice**: Used for all UI state (Messages, Session ID, Notes List).
- **Reasoning**: Provides fine-grained reactivity and reduces change detection overhead compared to Zone.js heavy approaches.

### **In-Memory Vector Search**
- **Choice**: Keep `MemoryVectorStore`.
- **Reasoning**: Dataset size remains small for personal use. Fast startup time (<100ms for <1000 notes) makes database complexity unnecessary.

## 🚀 Future Improvements

1.  **Shared Library**: Extract types to `libs/shared-types`.
2.  **Database**: Migrate JSON to SQLite or Postgres for robust data safety.
3.  **Deployment**: Dockerize the stack (Dockerfile for API, Nginx for Web).
