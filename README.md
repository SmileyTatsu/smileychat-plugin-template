# SmileyChat Plugin Template

This is a minimal template for a SmileyChat browser plugin distributed as a prebuilt ZIP artifact.

End users should install the ZIP from the SmileyChat Store or from a manual artifact URL only when they trust the source. Users should not need Git, dependency installation, or a plugin build step to install the finished artifact.

## Requirements

- Bun for local plugin development and packaging.

## Files

- `plugin.json`: SmileyChat manifest. Change `id`, `name`, `version`, and `description` before publishing.
- `src/index.ts`: Plugin runtime entrypoint. It exports `activate(api)`.
- `styles/plugin.css`: CSS copied to `dist/plugin.css` during build.
- `scripts/copy-static.ts`: Copies static files needed by the built plugin.
- `scripts/pack.ts`: Creates `release/<plugin-id>-<version>.zip`.

## Develop Locally

1. Edit `plugin.json` and choose a stable folder-safe `id`.
2. Install development dependencies with `bun install`.
3. Build with `bun run build`.
4. Copy this plugin folder into `SmileyChat/userData/plugins/<plugin-id>` for local testing.
5. In SmileyChat, open Options > Plugins and refresh/reload plugins.

The local folder must contain `plugin.json` and the built files referenced by `main` and `styles`.

## Package a Release Artifact

Run:

```sh
bun run pack
```

The packer creates:

```text
release/<plugin-id>-<version>.zip
```

The ZIP contains a root `plugin.json`, built `dist/**` files, and optional `assets/**` files. It does not include `src`, `node_modules`, lockfiles, or release output.

## Registry Distribution

A verified registry entry should point at the prebuilt ZIP artifact:

```json
{
    "id": "example-plugin",
    "name": "Example Plugin",
    "version": "1.0.0",
    "artifact": {
        "url": "https://example.com/example-plugin-1.0.0.zip"
    }
}
```

SmileyChat installs the prebuilt artifact directly. The user-facing install flow does not require SHA-256 hashes, Git, dependency installation, or plugin builds.

## Trust Model

SmileyChat plugins are trusted local browser code. Registry artifacts are curated but not sandboxed. Manual artifacts are unverified and should only be installed from sources the user trusts.
