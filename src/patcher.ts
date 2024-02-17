import electron, {
    app,
    BrowserWindowConstructorOptions
} from 'electron';

import installExt, {
    REACT_DEVELOPER_TOOLS
} from 'electron-devtools-installer';

import {
    join
} from 'path';

import {
    initIpc
} from './ipcMain';

console.log("[deimos] inicializando...");

class BrowserWindow extends electron.BrowserWindow {
    constructor(options: BrowserWindowConstructorOptions) {
        if (options?.webPreferences?.preload && options.title) {
            const original = options.webPreferences.preload;

            options.webPreferences.preload = join(__dirname, "preload.js");

            process.env.DISCORD_PRELOAD = original;

            super(options);

            initIpc(this);
        } else super(options);
    }
}

Object.assign(BrowserWindow, electron.BrowserWindow);

// esbuild pode renomear o browserwindow, que lidera para ser excluído
// do getfocusedwindow(), então é necessário
//
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
Object.defineProperty(BrowserWindow, "name", {
    value: "BrowserWindow",
    configurable: true
});

// substituir exports do electron com nosso browserwindow customizado
const electronPath = require.resolve("electron");

delete require.cache[electronPath]!.exports;

require.cache[electronPath]!.exports = {
    ...electron,

    BrowserWindow
};

// patch appsettings para forçar habilitação dos devtools
Object.defineProperty(global, "appSettings", {
    set: (v: typeof global.appSettings) => {
        v.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);

        // @ts-ignore
        delete global.appSettings;

        global.appSettings = v;
    },

    configurable: true
});

process.env.DATA_DIR = join(app.getPath("userData"), "..", "Deimos");

electron.app.whenReady().then(() => {
    installExt(REACT_DEVELOPER_TOOLS)
        .then(() => console.info("devtools do react instalado"))
        .catch((err) => console.error("falha ao instalar devtools do react", err));

    // remover csp
    electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders, url}, cb) => {
        if (responseHeaders) {
            delete responseHeaders["content-security-policy-report-only"];
            delete responseHeaders["content-security-policy"];
        }

        cb({
            cancel: false,
            responseHeaders
        });
    });

    // dropar science e solicitações sentry
    electron.session.defaultSession.webRequest.onBeforeRequest(
        {
            urls: ["https://*/api/v*/science", "https://sentry.io/*"]
        }, (_, callback) => callback({
            cancel: true
        })
    );
});