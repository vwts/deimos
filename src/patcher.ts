import electron, {
    app,
    BrowserWindowConstructorOptions
} from 'electron';

import {
    join
} from 'path';

import {
    initIpc
} from './ipcMain';

import {
	readSettings
} from './ipcMain/index';

console.log("[deimos] inicializando...");

class BrowserWindow extends electron.BrowserWindow {
    constructor(options: BrowserWindowConstructorOptions) {
        if (options?.webPreferences?.preload && options.title) {
            const original = options.webPreferences.preload;

            options.webPreferences.preload = join(__dirname, "preload.js");
            options.webPreferences.sandbox = false;

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
	try {
        const settings = JSON.parse(readSettings());

        if (settings.enableReactDevtools)
            import('electron-devtools-installer')
                .then(({ default: inst, REACT_DEVELOPER_TOOLS }) =>
                    // @ts-ignore

                    (inst.default ?? inst)(REACT_DEVELOPER_TOOLS)
                )
                .then(() => console.info("[deimos] ferramentas de desenvolvedor react instaladas"))
                .catch(err => console.error("[deimos] falha ao instalar as ferramentas de desenvolvedor react", err));
    } catch { }

    // remover csp
    electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders, url}, cb) => {
        if (responseHeaders) {
            delete responseHeaders["content-security-policy-report-only"];
            delete responseHeaders["content-security-policy"];

			// correção de hosts que não setam o tipo de conteúdo apropriadamente
			if (url.endsWith(".css"))
				responseHeaders["content-type"] = ["text/css"];
        }

        cb({
            cancel: false,
            responseHeaders
        });
    });
});