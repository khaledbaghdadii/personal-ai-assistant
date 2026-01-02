# Backend Architecture (Focus: Developer Guide)

## 🗺 Overview
The backend is a Node.js/Express application that serves as the brain of the AI Planner. It orchestrates the LangChain agent, manages data persistence, and exposes a REST API for the frontend.

## 🏗 Key Components

### 1. Server Entry (`src/server.ts`)
- **Role**: Bootstraps the Express app and initializes the Vector Store.
- **Middleware**: `cors` (allows frontend access), `body-parser`.
- **Routes**:
    - `POST /api/chat`: Main entry point for agent interaction.
    - `GET/POST /api/notes`: CRUD for notes (Direct access).
    - `GET /api/search`: Semantic search endpoint (RAG).

### 2. Configuration (`src/config/index.ts`)
- **Design Choice**: Centralized configuration with explicit `dotenv` loading.
- **Why?**: Ensures environment variables are loaded regardless of import order in other modules. Avoids "process.env" scattering.

### 3. Agent Layer (`src/agent/`)
- **Factory Pattern**: `createPlannerAgent()` creates a configured LangChain agent.
- **Tools**: located in `src/agent/tools/`.
    - `save_note`: Critical tool for persistence. Includes **Safety Checks** (rejection of "password"/"key").
    - `search_notes`: RAG retrieval.
- **Execution Model**: **Stateless/Request-Based**.
    - We instantiate (or invoke) the agent per request.
    - `thread_id` is passed from the client to maintain logical sessions, utilizing `MemorySaver` (In-Memory Checkpointer).
    - *Limitation*: Memory is lost on server restart. *Future*: Redis/Postgres checkpointer.

### 4. Data Layer (`src/lib/`)
- **Notes Repository (`src/lib/notes/repository.ts`)**:
    - **Storage**: `apps/api/data/notes.json`.
    - **Why Filesystem?**:
        - Zero deployment overhead.
        - Easy to backup (just copy the file).
        - JSON is human-readable/debuggable.
- **Vector Store (`src/lib/vector/store.ts`)**:
    - **Tech**: `MemoryVectorStore` + `OpenAIEmbeddings`.
    - **Lifecycle**:
        1.  **On Startup**: Reads `notes.json`.
        2.  **Indexing**: Converts all notes to documents and embeds them.
        3.  **On Save**: Incrementally adds the new note to the index (No full rebuild needed).
    - **Why In-Memory?**: Vector databases (Pinecone/Chroma) introduce massive complexity. For <10,000 notes, Node.js heap is sufficient and 100x faster to "deploy".

## 🛠 Developer Notes

### Adding a New Tool
1.  Define the tool in `src/agent/tools/index.ts` using `DynamicStructuredTool`.
2.  Add it to the `tools` array in `createPlannerAgent`.
3.  **Prompt Engineering**: The agent usually figures it out, but updating the System Prompt in `src/agent/index.ts` helps for complex tools.

### Error Handling
- The `try/catch` blocks in `server.ts` ensure the server never crashes on Agent failure (e.g., OpenAI timeout). Always return `500` JSON responses.
