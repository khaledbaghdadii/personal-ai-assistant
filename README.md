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
- **🚀 Scalable**: Built with clean architecture (Signals, Standalone Components).

## Getting Started

### Prerequisites
- Node.js v18+
- OpenAI API Key

### Installation

1. **Setup Backend:**
   Create `.env` in `apps/api/`:
   ```env
   OPENAI_API_KEY=sk-...
   ```
   Install dependencies:
   ```bash
   cd apps/api
   npm install --legacy-peer-deps
   ```

2. **Setup Frontend:**
   Install dependencies (Note: requires legacy-peer-deps for some environments, or just standard install):
   ```bash
   cd apps/web
   npm install
   ```

### Running the App

Run the workflow command (Antigravity) or use two terminals:

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

## Troubleshooting

- **Frontend Build Errors**: If you see missing module errors, ensure you ran `npm install` inside `apps/web`.
- **Backend OpenAI Error**: Ensure `.env` is in `apps/api/` and has the correct key. Restart the backend after creating the file.

## Tech Stack

- **Backend**: Express, LangChain, MemoryVectorStore (In-Memory), OpenAI Embeddings.
- **Frontend**: Angular 18 (Standalone), Signals, Angular Material, Tailwind layout.
- **Data**: JSON persistence (`apps/api/data/notes.json`).

## License

ISC
