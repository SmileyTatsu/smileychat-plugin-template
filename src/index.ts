import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import type { SmileyPluginApi } from "../types/smileychat-plugin-api";

type ExampleSettings = {
    enabled: boolean;
};

const SETTINGS_KEY = "settings";
const DEFAULT_SETTINGS: ExampleSettings = { enabled: true };

export function activate(api: SmileyPluginApi) {
    api.ui.addStyles(`
        .example-plugin-panel {
            display: grid;
            gap: 10px;
            max-width: 520px;
        }

        .example-plugin-panel .example-plugin-runtime-note {
            margin: 0;
            color: var(--text-muted, #9ca3af);
            line-height: 1.5;
        }
    `);

    api.ui.registerSettingsPanel({
        id: "example-plugin-settings",
        label: "Example Plugin",
        // The panel body is a normal Preact component: the host renderer mounts
        // it, so hooks work through the shared Preact instance.
        render({ storage }) {
            return h(ExamplePanel, { api, storage });
        },
    });
}

function ExamplePanel({
    api,
    storage,
}: {
    api: SmileyPluginApi;
    storage: SmileyPluginApi["storage"];
}) {
    const [settings, setSettings] = useState<ExampleSettings>(DEFAULT_SETTINGS);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        let active = true;

        void storage.getJson(SETTINGS_KEY, DEFAULT_SETTINGS).then((stored) => {
            if (active) {
                setSettings(stored);
            }
        });

        return () => {
            active = false;
        };
    }, [storage]);

    async function toggleSetting() {
        const next = { enabled: !settings.enabled };
        setSettings(next);
        await storage.setJson(SETTINGS_KEY, next);
    }

    return h(
        "div",
        { class: "example-plugin-panel" },
        h("h3", null, api.plugin.name),
        h(
            "p",
            { class: "example-plugin-runtime-note" },
            "This panel is rendered by a local SmileyChat plugin.",
        ),
        h("p", null, `Saved setting: ${settings.enabled ? "enabled" : "disabled"}`),
        h(
            "button",
            { type: "button", onClick: () => void toggleSetting() },
            "Toggle saved setting",
        ),
        h("p", null, `Local state: ${counter}`),
        h(
            "button",
            { type: "button", onClick: () => setCounter((value) => value + 1) },
            "Increment local state",
        ),
    );
}
