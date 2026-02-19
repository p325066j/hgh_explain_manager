import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE = ".env.local";

const loadEnv = () => {
  const envPath = resolve(process.cwd(), ENV_FILE);
  if (!existsSync(envPath)) {
    return;
  }
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = rawValue.replace(/^"|"$/g, "");
    process.env[key] = value;
  }
};

const toAbsoluteFileUrl = (url) => {
  if (!url || !url.startsWith("file:")) return url;
  const filePath = url.slice("file:".length);
  const hasDriveLetter = /^[a-z]:/i.test(filePath);
  const isUnixAbsolute = filePath.startsWith("/");
  if (hasDriveLetter || isUnixAbsolute) {
    return `file:${filePath.replace(/\\/g, "/")}`;
  }
  const absolutePath = resolve(process.cwd(), filePath);
  return `file:${absolutePath.replace(/\\/g, "/")}`;
};

const prismaBin = process.platform === "win32"
  ? resolve(process.cwd(), "node_modules/.bin/prisma.cmd")
  : resolve(process.cwd(), "node_modules/.bin/prisma");

const runPrisma = async (args) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(prismaBin, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise(undefined);
      } else {
        rejectPromise(new Error(`prisma ${args.join(" ")} exited with code ${code}`));
      }
    });
  });

async function main() {
  loadEnv();
  process.env.DATABASE_URL = toAbsoluteFileUrl(process.env.DATABASE_URL);
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in .env.local");
  }

  await runPrisma(["generate"]);
  await runPrisma(["db", "push"]);
}

main().catch((error) => {
  console.error("[setup:db] failed:", error);
  process.exit(1);
});
