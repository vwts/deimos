import {
    addSettingsListener,
    Settings
} from '../api/settings';

import IpcEvents from './IpcEvents';

let style: HTMLStyleElement;

export async function toggle(isEnabled: boolean) {
    if (!style) {
        if (isEnabled) {
            style = document.createElement("style");
            style.id = "deimos-custom-css";

            document.head.appendChild(style);

            DeimosNative.ipc.on(IpcEvents.QUICK_CSS_UPDATE, (_, css: string) => style.innerText = css);

            style.innerText = await DeimosNative.ipc.invoke(IpcEvents.GET_QUICK_CSS);
        }
    } else style.disabled = !isEnabled;
}

document.addEventListener("DOMContentLoaded", () => {
    toggle(Settings.useQuickCss);

    addSettingsListener("useQuickCss", toggle);
});