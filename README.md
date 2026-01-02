# AI Planner - Personal Ops Assistant

A production-ready CLI Personal Assistant powered by LangChain, OpenAI, and Local Vector Search.

## Features

- **🧠 Conversation Memory**: Remembers context within the same session.
- **📚 Long-term Memory (RAG)**: Semantic search over your personal notes.
- **⚡ Interactive CLI**: Robust REPL with specialized slash commands.
- **🔒 Privacy-Focused**: Validates input to prevent storing secrets.
- **📂 Local Storage**: JSON-based storage for easy backup and portability.

## Project Structure

This project follows a modular architecture:

```
src/
├── agent/          # AI Agent configuration
│   └── tools/      # LangChain tools definitions
├── cli/            # CLI Logic
│   ├── commands.ts # Command handlers
│   └── repl.ts     # Main event loop
├── config/         # Centralized configuration
├── lib/            # Data Access Layer
│   ├── notes/      # File system operations
│   └── vector/     # Vector store operations
├── types/          # Shared type definitions
└── index.ts        # Entry point
```

## Getting Started

### Prerequisites
- Node.js v18+
- OpenAI API Key

### Installation

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```env
   OPENAI_API_KEY=sk-...
   ```

### Usage

Start the assistant:
```bash
npm run dev
```

### Commands

| Command | Description |
| :--- | :--- |
| `/help` | Show available commands |
| `/save <Title> | <Content>` | Save a note (Splits on first `|`) |
| `/notes` | List recent notes |
| `/search <query>` | Semantic search for notes |
| `/newsession <name>` | Switch session context |
| `/exit` | Exit application |

## License

ISC
