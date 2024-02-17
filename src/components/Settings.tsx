import {
    useAwaiter
} from '../utils/misc';

import {
    useSettings
} from '../api/settings';

import {
    Button,
    ButtonProps,
    Flex,
    Switch,
    Forms
} from '../webpack/common';

import {
    startPlugin
} from '../plugins';

import {
    stopPlugin
} from '../plugins/index';

import Plugins from 'plugins';
import IpcEvents from '../utils/IpcEvents';
import ErrorBoundary from './ErrorBoundary';

export default ErrorBoundary.wrap(function Settings(props) {
    const [settingsDir, , settingsDirPending] = useAwaiter(() => DeimosNative.ipc.invoke<string>(IpcEvents.GET_SETTINGS_DIR), "carregando...");
    const settings = useSettings();

    return (
        <Forms.FormSection tag="h1" title="deimos">
            <Forms.FormText>SettingsDir: {settingsDir}</Forms.FormText>

            <Flex style={{ marginTop: "8px", marginBottom: "8px" }}>
                <Flex.Child>
                    <Button
                        onClick={() => DeimosNative.ipc.invoke(IpcEvents.OPEN_PATH, settingsDir)}
                        size={ButtonProps.ButtonSizes.SMALL}
                        disabled={settingsDirPending}
                    >
                        executar diretório
                    </Button>
                </Flex.Child>

                <Flex.Child>
                    <Button
                        onClick={() => DeimosNative.ipc.invoke(IpcEvents.OPEN_PATH, settingsDir + "/quickCss.css")}
                        size={ButtonProps.ButtonSizes.SMALL}
                        disabled={settingsDir === "carregando..."}
                    >
                        abrir arquivo quickcss
                    </Button>
                </Flex.Child>
            </Flex>

            <Forms.FormTitle tag="h5">configurações</Forms.FormTitle>

            <Switch
                value={settings.unsafeRequire}
                onChange={v => settings.unsafeRequire = v}
                note="habilita deimosnative.require. útil para testes, muito ruim para segurança."
            >
                habilitar ensafe require
            </Switch>
            
            <Forms.FormDivider />

            <Forms.FormTitle tag="h5">plugins</Forms.FormTitle>

            {Object.values(Plugins).map(p => (
                <Switch
                    disabled={p.required === true}
                    key={p.name}
                    value={settings.plugins[p.name].enabled}

                    onChange={v => {
                        settings.plugins[p.name].enabled = v;
                        
                        if (v) {
                            p.dependencies?.forEach(d => {
                                // todo: inicializar qualquer dependência

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
                    tooltipNote={p.required ? "esse plugin é necessário. você não pode desabilitar isso." : undefined}
                >
                    {p.name}
                </Switch>
            ))}
        </Forms.FormSection >
    );
});