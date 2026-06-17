import AdmZip from "adm-zip";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

type PluginManifest = {
    id?: unknown;
    name?: unknown;
    version?: unknown;
    main?: unknown;
    styles?: unknown;
};

const rootDir = resolve(import.meta.dir, "..");
const releaseDir = join(rootDir, "release");
const manifestPath = join(rootDir, "plugin.json");
const manifest = (await Bun.file(manifestPath).json()) as PluginManifest;

const pluginId = requireString(manifest.id, "plugin.json id");
const version = requireString(manifest.version, "plugin.json version");
const mainPath = safeManifestPath(requireString(manifest.main, "plugin.json main"), "main");
const stylePaths = Array.isArray(manifest.styles)
    ? manifest.styles.map((style, index) =>
          safeManifestPath(requireString(style, `plugin.json styles[${index}]`), `styles[${index}]`),
      )
    : [];

if (!/^[A-Za-z0-9._-]+$/.test(pluginId) || pluginId === "." || pluginId === "..") {
    throw new Error("plugin.json id must be a non-empty folder-safe value.");
}

await assertFileExists(join(rootDir, mainPath), `main file '${mainPath}'`);
for (const stylePath of stylePaths) {
    await assertFileExists(join(rootDir, stylePath), `style file '${stylePath}'`);
}

const zip = new AdmZip();
zip.addLocalFile(manifestPath, "", "plugin.json");

for (const filePath of await listFiles(join(rootDir, "dist"))) {
    addFile(zip, filePath);
}

for (const filePath of await listFiles(join(rootDir, "assets"))) {
    addFile(zip, filePath);
}

await mkdir(releaseDir, { recursive: true });
const outputPath = join(releaseDir, `${pluginId}-${version}.zip`);
await rm(outputPath, { force: true });
zip.writeZip(outputPath);

console.log(`Created ${relative(rootDir, outputPath).replace(/\\/g, "/")}`);

function requireString(value: unknown, label: string): string {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${label} must be a non-empty string.`);
    }

    return value.trim();
}

function safeManifestPath(value: string, label: string): string {
    const normalized = value.replace(/\\/g, "/").replace(/^\.\/+/, "");
    const parts = normalized.split("/");

    if (
        !normalized ||
        normalized.startsWith("/") ||
        /^[A-Za-z]:/.test(normalized) ||
        parts.some((part) => !part || part === "." || part === "..")
    ) {
        throw new Error(`plugin.json ${label} must be a safe relative path.`);
    }

    return normalized;
}

async function assertFileExists(path: string, label: string) {
    const info = await stat(path).catch(() => undefined);
    if (!info?.isFile()) {
        throw new Error(`Expected ${label} to exist. Run 'bun run build' before packing.`);
    }
}

async function listFiles(dir: string): Promise<string[]> {
    const info = await stat(dir).catch(() => undefined);
    if (!info?.isDirectory()) {
        return [];
    }

    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const fullPath = join(dir, entry.name);
            return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
        }),
    );

    return files.flat();
}

function addFile(zip: AdmZip, filePath: string) {
    const archivePath = relative(rootDir, filePath).replace(/\\/g, "/");
    if (!archivePath || archivePath.startsWith("..") || archivePath.includes("/../")) {
        throw new Error(`Refusing to package unsafe path '${archivePath}'.`);
    }

    zip.addLocalFile(filePath, archivePath.slice(0, archivePath.lastIndexOf("/")) || undefined);
}
