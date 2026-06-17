import { copyFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const rootDir = resolve(import.meta.dir, "..");
const distDir = join(rootDir, "dist");

await mkdir(distDir, { recursive: true });
await copyFile(join(rootDir, "styles", "plugin.css"), join(distDir, "plugin.css"));

console.log("Copied static plugin files to dist/.");
