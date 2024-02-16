import IpcEvents from './IpcEvents';

document.addEventListener("DOMContentLoaded", async () => {
    const style = document.createElement("style");

    document.head.appendChild(style);

    DeimosNative.ipc.on(IpcEvents.QUICK_CSS_UPDATE, (_, css: string) => style.innerText = css);

    style.innerText = await DeimosNative.ipc.invoke(IpcEvents.GET_QUICK_CSS);
});