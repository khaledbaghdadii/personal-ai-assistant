# AI Planner - Full Stack Personal Ops Assistant

A production-ready Web Application powered by LangChain, OpenAI, Express, and Angular.

## 🏗 Architecture

This project is a monorepo containing:

- **`apps/api`**: Express Backend with LangChain RAG agent.
- **`apps/web`**: Angular 18 Frontend with Material UI.

## Features

- **💬 Conversational Interface**: Modern chat UI with history.
- **🧠 RAG Memory**: Semantic search over personal notes.
- **📝 Note Management**: Create, list, and search notes via Sidebar.
- **🔒 Privacy**: Secrets validation mechanism.

## Getting Started

### Prerequisites
- Node.js v18+
- OpenAI API Key

### Installation

1. Create a `.env` file in `apps/api/` with:
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. Install dependencies for Backend:
   ```bash
   cd apps/api
   npm install --legacy-peer-deps
   ```

3. Install dependencies for Frontend:
   ```bash
   cd apps/web
   npm install
   ```

### Running the App

You need two terminals:

**Terminal 1: Backend**
```bash
cd apps/api
npm run dev
# Running on http://localhost:3000
```

**Terminal 2: Frontend**
```bash
cd apps/web
npm start
# Running on http://localhost:4200
```

## Tech Stack

- **Backend**: Express, LangChain, MemoryVectorStore (In-Memory), OpenAI Embeddings.
- **Frontend**: Angular 18 (Standalone), Signals, Angular Material, Tailwind layout.
- **Data**: JSON persistence (`apps/api/data/notes.json`).

## License

ISC
