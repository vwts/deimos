import {
	classes,
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
    React,
	Margins,
    Toasts,
    Alerts,
    Parser
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

import {
    ChangeList
} from '../utils/ChangeList';

import Plugins from 'plugins';
import IpcEvents from '../utils/IpcEvents';
import ErrorBoundary from './ErrorBoundary';

function showErrorToast(message: string) {
    Toasts.show({
        message,

        type: Toasts.Type.FAILURE,
        id: Toasts.genId(),

        options: {
            position: Toasts.Position.BOTTOM
        }
    });
}

export default ErrorBoundary.wrap(function Settings() {
    const [settingsDir, , settingsDirPending] = useAwaiter(() => DeimosNative.ipc.invoke<string>(IpcEvents.GET_SETTINGS_DIR), "carregando...");

    const settings = useSettings();
    const changes = React.useMemo(() => new ChangeList<string>, []);

    React.useEffect(() => {
        return () => void (changes.hasChanges && Alerts.show({
            title: "reinicialização necessária",

            body: (
                <>
                    <p>os seguintes plugins necessitam de uma reinicialização:</p>

                    <div>{changes.map((s, i) => (
                        <>
                            {i > 0 && ", "}

                            {Parser.parse('`' + s + '`')}
                        </>
                    ))}</div>
                </>
            ),

            confirmText: "reiniciar agora",
            cancelText: "depois!",

            onConfirm: () => location.reload()
        }));
    }, []);

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
			<Forms.FormTitle tag="h5">
				configurações
			<Forms.FormTitle/>

			<Forms.FormText>
				SettingsDir: <code style={{ userSelect: 'text', cursor: 'text' }}>
					{settingsDir}
				</code>
			</Forms.FormText>

			<Flex className={classes(Margins.marginBottom20)}>
				<Button
					onClick={() => location.reload()}

					size={Button.Sizes.SMALL}
					color={Button.Colors.GREEN}
				>
					recarregar
				</Button>

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

			<Forms.FormDivider />

			<Forms.FormTitle tag="h5">
				configurações
			</Forms.FormTitle>

            <Switch
                value={settings.useQuickCss}
                onChange={(v: boolean) => settings.useQuickCss = v}
                note="habilitar quickcss"
            >
                usar quickcss
            </Switch>

			<Switch
				value={settings.notifyAboutUpdates}
				onChange={(v: boolean) => settings.notifyAboutUpdates = v}
				note="mostra um toast na inicialização"
			>
				notificado quando novas atualizações forem lançadas
			</Switch>

            <Switch
                value={settings.unsafeRequire}
                onChange={(v: boolean) => settings.unsafeRequire = v}
                note="habilita deimosnative.require. útil para testes, muito ruim para segurança."
            >
                habilitar unsafe require
            </Switch>

            <Forms.FormDivider />

			<Forms.FormTitle tag="h5" className={classes(Margins.marginTop20, Margins.marginBottom8)}>
				plugins
			</Forms.FormTitle>

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
                                        settings.plugins[p.name].enabled = false;

                                        showErrorToast(`falha ao iniciar a dependência ${d}. veja o console para mais informações.`);
                                    }
                                });

                                if (!p.started && !startPlugin(p)) {
                                    showErrorToast(`falha ao iniciar a dependência ${p.name}. veja o console para mais informações.`);
                                }
                            } else {
                                if (p.started && !stopPlugin(p)) {
                                    showErrorToast(`falha ao iniciar a dependência ${p.name}. veja o console para mais informações.`);
                                }
                            }

                            if (p.patches) {
                                changes.handleChange(p.name);
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