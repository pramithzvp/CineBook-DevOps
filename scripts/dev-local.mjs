import { fileURLToPath } from "node:url";

// Polling avoids unavailable filesystem watchers in the macOS Codex sandbox.
if (process.env.CODEX_SANDBOX === "seatbelt") {
  process.env.WATCHPACK_POLLING ??= "true";
}

const cli = new URL("../node_modules/next/dist/bin/next", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), "dev", "--webpack",
  "--hostname", "127.0.0.1", ...process.argv.slice(2)];
await import(cli.href);
