# SmileyChat Plugin Template

This is a minimal template for a SmileyChat browser plugin distributed as a prebuilt ZIP artifact.

End users should install the ZIP from the SmileyChat Store or from a manual artifact URL only when they trust the source. Users should not need Git, dependency installation, or a plugin build step to install the finished artifact.

## Requirements

- Bun for local plugin development and packaging.

## Files

- `plugin.json`: SmileyChat manifest. Change `id`, `name`, `version`, and `description` before publishing.
- `src/index.ts`: Plugin runtime entrypoint. It exports `activate(api)`.
- `types/smileychat-plugin-api.d.ts`: generated plugin API typings. Do not edit; see below.
- `styles/plugin.css`: CSS copied to `dist/plugin.css` during build.
- `scripts/copy-static.ts`: Copies static files needed by the built plugin.
- `scripts/pack.ts`: Creates `release/<plugin-id>-<version>.zip`.

## Plugin API Typings

`types/smileychat-plugin-api.d.ts` is generated from the SmileyChat app, so the types cannot drift from the runtime.

Refresh it with:

```sh
bun run update-types            # tracks SmileyChat main
bun run update-types --ref v1.2.0
```

The script downloads `types/smileychat-plugin-api.d.ts` from the SmileyChat repo and refuses anything that does not look like those typings. Commit the refreshed file so a clone typechecks without network access.

Typecheck plugins against it instead of redeclaring API members:

```ts
import type { SmileyPluginApi } from "../types/smileychat-plugin-api";
```

`preact` is a dev dependency only because the typings reference its `VNode` and `ComponentChildren` types.

## Preact and Hooks

Import Preact normally:

```ts
import { h } from "preact";
import { useState } from "preact/hooks";
```

The build keeps `preact` external (`--external preact`, which also covers `preact/hooks` and `preact/jsx-runtime`). SmileyChat serves an import map that points every `preact*` specifier at its own Preact instance.

Do not bundle Preact into the plugin. Two Preact copies each own their internal `options` object and hooks install themselves on the instance they were imported from, so a bundled copy makes `preact/hooks` inert inside panels the host renders.

## API Versions

`plugin.json` declares `apiVersion`, the plugin API contract the plugin was built against. Current value: `1`.

SmileyChat refuses to install or load a plugin that declares a newer API than the running build supports, instead of activating it against an unknown surface. Optional `minAppVersion` (semver) does the same for app versions. Leave both out only for plugins that predate the contract; they are then treated as API 1.

## Permissions and Approvals

`permissions` lists what the plugin uses. Install consent covers that list, except for permissions with a runtime approval step: `connections:secrets` (reading saved provider API keys) must also be enabled per plugin in Options > Plugins. The plugin still loads without it; `api.connections.getProfileWithSecrets` and `hasApiKey` throw with instructions until the user approves.

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
