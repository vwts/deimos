import Plugins from 'plugins';
import IpcEvents from '../utils/IpcEvents';

import {
    lazy,
    LazyComponent,
    useAwaiter
} from '../utils/misc';

import {
    findByDisplayName,
    Forms
} from '../webpack';

import {
    useSettings
} from '../api/settings';

import {
    findByProps
} from '../webpack/index';

const SwitchItem = LazyComponent<React.PropsWithChildren<{
    value: boolean;
    onChange: (v: boolean) => void;
    note?: string;
    tooltipNote?: string;
    disabled?: boolean;
}>>(() => findByDisplayName("SwitchItem").default);

const getButton = lazy(() => findByProps("ButtonLooks", "default"));
const Button = LazyComponent(() => getButton().default);
const getFlex = lazy(() => findByDisplayName("Flex"));
const Flex = LazyComponent(() => getFlex().default);
const FlexChild = LazyComponent(() => getFlex().default.Child);
const getMargins = lazy(() => findByProps("marginTop8", "marginBottom8"));

export default function Settings(props) {
    const settingsDir = useAwaiter(() => DeimosNative.ipc.invoke(IpcEvents.GET_SETTINGS_DIR), "carregando...");
    const settings = useSettings();

    return (
        <Forms.FormSection tag="h1" title="deimos">
            <Forms.FormText>SettingsDir: {settingsDir}</Forms.FormText>

            <Flex className={getMargins().marginTop8 + " " + getMargins().marginBottom8}>
                <FlexChild>
                    <Button
                        onClick={() => DeimosNative.ipc.invoke(IpcEvents.OPEN_PATH, settingsDir)}
                        size={getButton().ButtonSizes.SMALL}
                        disabled={settingsDir === "carregando..."}
                    >
                        executar diretório
                    </Button>
                </FlexChild>

                <FlexChild>
                    <Button
                        onClick={() => DeimosNative.ipc.invoke(IpcEvents.OPEN_PATH, settingsDir + "/quickCss.css")}
                        size={getButton().ButtonSizes.SMALL}
                        disabled={settingsDir === "carregando..."}
                    >
                        abrir arquivo quickcss
                    </Button>
                </FlexChild>
            </Flex>

            <Forms.FormTitle tag="h5">configurações</Forms.FormTitle>

            <SwitchItem
                value={settings.unsafeRequire}
                onChange={v => settings.unsafeRequire = v}
                note="habilita deimosnative.require. útil para testes, muito ruim para segurança."
            >
                habilitar ensafe require
            </SwitchItem>
            
            <Forms.FormDivider />

            <Forms.FormTitle tag="h5">plugins</Forms.FormTitle>

            {Plugins.map(p => (
                <SwitchItem
                    disabled={p.required === true}
                    key={p.name}
                    value={settings.plugins[p.name].enabled}

                    onChange={v => {
                        settings.plugins[p.name].enabled = v;
                        if (v) {
                            p.dependencies?.forEach(d => {
                                settings.plugins[d].enabled = true;
                            });
                        }
                    }}

                    note={p.description}
                    tooltipNote={p.required ? "esse plugin é necessário. você não pode desabilitar isso." : undefined}
                >
                    {p.name}
                </SwitchItem>
            ))}
        </Forms.FormSection >
    );
}