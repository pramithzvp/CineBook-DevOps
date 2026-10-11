import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = fileURLToPath(new URL("../backend/.env.local", import.meta.url));
if (existsSync(envFile)) loadEnvFile(envFile);
const command = process.argv[2] ?? "run";
if (!["run", "test", "package"].includes(command)) throw new Error("Expected run, test, or package");
if (command === "run" && (!process.env.DB_USERNAME && !process.env.DB_USER || !process.env.DB_PASSWORD)) {
  throw new Error("Set DB_USERNAME and DB_PASSWORD in backend/.env.local before starting.");
}
const args = ["--batch-mode", "--no-transfer-progress", "-f", "backend/pom.xml"];
if (process.env.MAVEN_REPO_LOCAL) args.push(`-Dmaven.repo.local=${process.env.MAVEN_REPO_LOCAL}`);
args.push(command === "run" ? "spring-boot:run" : command);
const child = spawn(process.env.MAVEN_BIN || "mvn", args, { cwd: root, stdio: "inherit", env: process.env });
child.on("error", error => { console.error(`Cannot launch Maven: ${error.message}. Install Maven or set MAVEN_BIN in backend/.env.local.`); process.exitCode = 1; });
child.on("exit", code => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
