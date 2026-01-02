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

### Usage Scenarios

#### 1. Conversational Memory
The assistant remembers context within the session.
```text
> My name is Khaled
AI: Nice to meet you, Khaled!

> What is my name?
AI: Your name is Khaled.
```

#### 2. Saving Notes (Long-term Memory)
You can save notes directly or asking the AI to remember something.
```text
> /save Running Goal | I want to run 10k in under 50 mins
✓ Saved note: "Running Goal"

> /save Gift Ideas | Buy a coffee maker for Sarah
✓ Saved note: "Gift Ideas"
```

#### 3. Semantic Search (RAG)
Ask questions about your notes, even without exact keywords.
```text
> What are my fitness targets?
AI: You have a goal to run 10k in under 50 minutes. (Source: Running Goal)

> /search coffee
Searching for: "coffee"...
1. [ID: ... | Gift Ideas | ...] Buy a coffee maker for Sarah
```

#### 4. Managing Sessions
Switch context for different projects or topics.
```text
> /newsession project-alpha
✓ Switched to session: project-alpha

> /notes
(Lists notes regardless of session)
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
