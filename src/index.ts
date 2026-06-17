type ComponentChild = unknown;

type PluginStorageApi = {
    getJson<T>(key: string, fallback: T): Promise<T>;
    setJson<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
};

type SettingsPanelProps = {
    pluginId: string;
    storage: PluginStorageApi;
};

type SmileyPluginApi = {
    plugin: {
        id: string;
        name: string;
        version: string;
    };
    ui: {
        h(type: string, props: Record<string, unknown> | null, ...children: ComponentChild[]): ComponentChild;
        registerSettingsPanel(panel: {
            id: string;
            label: string;
            render(props: SettingsPanelProps): ComponentChild;
        }): void;
        addStyles(cssText: string): void;
    };
    storage: PluginStorageApi;
};

type ExampleSettings = {
    enabled: boolean;
};

const SETTINGS_KEY = "settings";
const DEFAULT_SETTINGS: ExampleSettings = {
    enabled: true,
};

export function activate(api: SmileyPluginApi) {
    const { h } = api.ui;

    api.ui.addStyles(`
        .example-plugin-runtime-note {
            color: var(--text-muted, #9ca3af);
        }
    `);

    api.ui.registerSettingsPanel({
        id: "example-plugin-settings",
        label: "Example Plugin",
        render({ storage }) {
            async function toggleSetting() {
                const current = await storage.getJson(SETTINGS_KEY, DEFAULT_SETTINGS);
                await storage.setJson(SETTINGS_KEY, {
                    enabled: !current.enabled,
                });
            }

            return h(
                "div",
                { class: "example-plugin-panel" },
                h("h3", null, api.plugin.name),
                h(
                    "p",
                    { class: "example-plugin-runtime-note" },
                    "This panel is rendered by a local SmileyChat plugin."
                ),
                h(
                    "button",
                    {
                        type: "button",
                        onClick: toggleSetting,
                    },
                    "Toggle saved setting"
                )
            );
        },
    });
}
