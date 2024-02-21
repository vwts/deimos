import {
    humanFriendlyJoin,
    useAwaiter
} from '../utils/misc';

import {
    useSettings
} from '../api/settings';

import {
    Button,
    Switch,
    Forms,
    React
} from '../webpack/common';

import {
    startPlugin
} from '../plugins';

import {
    stopPlugin
} from '../plugins/index';

import {
	Flex
} from './Flex';

import Plugins from 'plugins';
import IpcEvents from '../utils/IpcEvents';
import ErrorBoundary from './ErrorBoundary';

export default ErrorBoundary.wrap(function Settings(props) {
    const [settingsDir, , settingsDirPending] = useAwaiter(() => DeimosNative.ipc.invoke<string>(IpcEvents.GET_SETTINGS_DIR), "carregando...");
    const settings = useSettings();

    const depMap = React.useMemo(() => {
        const o = {} as Record<string, string[]>;

        for (const plugin in Plugins) {
            const deps = Plugins[plugin].dependencies;

            if (deps) {
                for (const dep of deps) {
                    o[dep] ??= [];

                    o[dep].push(plugin);
                }
            }
        }

        return o;
    }, []);

    const sortedPlugins = React.useMemo(() => Object.values(Plugins).sort((a, b) => a.name.localeCompare(b.name)), []);

    return (
        <Forms.FormSection tag="h1" title="deimos">
            <Forms.FormText>SettingsDir: {settingsDir}</Forms.FormText>

            <Flex style={{ marginTop: "8px", marginBottom: "8px" }}>
				<Button
                    onClick={() => DeimosNative.ipc.invoke(IpcEvents.OPEN_PATH, settingsDir)}
                    size={Button.Sizes.SMALL}
                    disabled={settingsDirPending}
                >
                    executar diretório
                </Button>

                <Button
                    onClick={() => DeimosNative.ipc.invoke(IpcEvents.OPEN_PATH, settingsDir, "quickCss.css")}
                    size={Button.Sizes.SMALL}
                    disabled={settingsDir === "carregando..."}
                >
                    abrir arquivo quickcss
                </Button>
            </Flex>

            <Forms.FormTitle tag="h5">configurações</Forms.FormTitle>

            <Switch
                value={settings.useQuickCss}
                onChange={v => settings.useQuickCss = v}
                note="habilitar quickcss"
            >
                usar quickcss
            </Switch>

            <Switch
                value={settings.unsafeRequire}
                onChange={v => settings.unsafeRequire = v}
                note="habilita deimosnative.require. útil para testes, muito ruim para segurança."
            >
                habilitar unsafe require
            </Switch>

            <Forms.FormDivider />

            <Forms.FormTitle tag="h5">plugins</Forms.FormTitle>

            {sortedPlugins.map(p => {
                const enableDependants = depMap[p.name]?.filter(d => settings.plugins[d].enabled);
                const dependency = enableDependants?.length;

                return (
                    <Switch
                        disabled={p.required || dependency}
                        key={p.name}
                        value={settings.plugins[p.name].enabled || p.required || dependency}

                        onChange={v => {
                            settings.plugins[p.name].enabled = v;

                            if (v) {
                                p.dependencies?.forEach(d => {
                                    settings.plugins[d].enabled = true;

                                    if (!Plugins[d].started && !stopPlugin) {
                                        // todo: mostrar notificação
                                        settings.plugins[p.name].enabled = false;
                                    }
                                });

                                if (!p.started && !startPlugin(p)) {
                                    // todo: mostrar notificação
                                }
                            } else {
                                if (p.started && !stopPlugin(p)) {
                                    // todo: mostrar notificação
                                }
                            }

                            if (p.patches) {
                                // todo: mostrar notificação
                            }
                        }}

                        note={p.description}

                        tooltipNote={
                            p.required ?
                                "esse plugin é necessário. você não pode desabilitá-lo."
                                : dependency
                                ? `${humanFriendlyJoin(enableDependants)} ${enableDependants.length === 1 ? "depends" : "depend"} nesse plugin. você não pode desabilitá-lo.`
                                : null
                        }
                    >
                        {p.name}
                    </Switch>
                );
            })}
        </Forms.FormSection >
    );
});