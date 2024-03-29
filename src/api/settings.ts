import {
    React
} from '../webpack/common';

import {
    mergeDefaults
} from '../utils/misc';

import plugins from 'plugins';
import IpcEvents from '../utils/IpcEvents';

export interface Settings {
	notifyAboutUpdates: boolean;
    useQuickCss: boolean;
	enableReactDevtools: boolean;

    plugins: {
        [plugin: string]: {
            enabled: boolean;

            [setting: string]: any;
        };
    };
}

const DefaultSettings: Settings = {
	notifyAboutUpdates: true,
    useQuickCss: true,
	enableReactDevtools: false,

    plugins: {}
};

for (const plugin in plugins) {
    DefaultSettings.plugins[plugin] = {
        enabled: plugin[plugin].required ?? false
    };
}

try {
    var settings = JSON.parse(DeimosNative.ipc.sendSync(IpcEvents.GET_SETTINGS)) as Settings;

    for (const key in DefaultSettings) {
        settings[key] ??= DefaultSettings[key];
    }

    mergeDefaults(settings, DefaultSettings);
} catch (err) {
    console.error("arquivo de configurações corrompido. ", err);

    var settings = mergeDefaults({} as Settings, DefaultSettings);
}

type SubscriptionCallback = ((newValue: any, path: string) => void) & {
    _path?: string;
};

const subscriptions = new Set<SubscriptionCallback>();

function makeProxy(settings: Settings, root = settings, path = ""): Settings {
    return new Proxy(settings, {
        get(target, p: string) {
            const v = target[p];

            if (typeof v === 'object' && !Array.isArray(v))
                return makeProxy(v, root, `${path}${path && "."}${p}`);

            return v;
        },

        set(target, p: string, v) {
            if (target[p] === v) return true;

            target[p] = v;

            const setPath = `${path}${path && "."}${p}`;

            for (const subscription of subscriptions) {
                if (!subscription._path || subscription._path === setPath) {
                    subscription(v, setPath);
                }
            }

            DeimosNative.ipc.invoke(IpcEvents.SET_SETTINGS, JSON.stringify(root, null, 4));

            return true;
        }
    });
}

/**
 * objeto de configurações. alterando propriedades automaticamente salva
 * as configurações atualizadas para o disco.
 */
export const Settings = makeProxy(settings);

/**
 * hook de configurações para componentes react.
 */
export function useSettings() {
    const [, forceUpdate] = React.useReducer(() => ({}), {});

    React.useEffect(() => {
        subscriptions.add(forceUpdate);

        return () => void subscriptions.delete(forceUpdate);
    }, []);

    return Settings;
}

// resolve uma propriedade na forma de "some.nested.prop" para tipo de
// t.some.nested.prop
type ResolvePropDeep<T, P> = P extends "" ? T :
    P extends `${infer Pre}.${infer Suf}`
    ? Pre extends keyof T ? ResolvePropDeep<T[Pre], Suf> : never : P extends keyof T ? T[P] : never;

/**
 * adiciona um ouvinte de configurações que será invocado sempre que a configuração desejada for atualizada
 *
 * @param path caminho para a configuração que você deseja assistir
 * @param onUpdate função callback sempre que um caminho que coincida for atualizado
 *
 * @example addSettingsListener("", (newValue, path) => console.log(`${path} is now ${newValue}`))
 *          addSettingsListener("plugins.Unindent.enabled", v => console.log("unindent é agora", v ? "enabled" : "disabled"))
 */
export function addSettingsListener<Path extends keyof Settings>(path: Path, onUpdate: (newValue: Settings[Path], path: Path) => void): void;
export function addSettingsListener<Path extends string>(path: Path, onUpdate: (newValue: Path extends "" ? any : ResolvePropDeep<Settings, Path>, path: Path extends "" ? string : Path) => void): void;

export function addSettingsListener(path: string, onUpdate: (newValue: any, path: string) => void) {
    (onUpdate as SubscriptionCallback)._path = path;

    subscriptions.add(onUpdate);
}