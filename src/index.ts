import "dotenv/config";
import { CLI } from "./cli/repl.js";

const cli = new CLI();
cli.start().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
