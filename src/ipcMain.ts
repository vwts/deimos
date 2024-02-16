import {
    app,
    BrowserWindow,
    ipcMain,
    shell
} from 'electron';

import {
    readFileSync,
    watch
} from 'fs';

import {
    open,
    readFile,
    writeFile
} from 'fs/promises';

import {
    join
} from 'path';

import IpcEvents from './utils/IpcEvents';

const DATA_DIR = join(app.getPath("userData"), "..", "Deimos");
const SETTINGS_DIR = join(DATA_DIR, "settings");
const QUICKCSS_PATH = join(SETTINGS_DIR, "quickCss.css");
const SETTINGS_FILE = join(SETTINGS_DIR, "settings.json");

function readCss() {
    return readFile(QUICKCSS_PATH, "utf-8").catch(() => "");
}

function readSettings() {
    try {
        return readFileSync(SETTINGS_FILE, "utf-8");
    } catch {
        return "{}";
    }
}

ipcMain.handle(IpcEvents.GET_SETTINGS_DIR, () => SETTINGS_DIR);
ipcMain.handle(IpcEvents.GET_QUICK_CSS, () => readCss());

ipcMain.on(IpcEvents.GET_SETTINGS, (e) => e.returnValue = readSettings());
ipcMain.handle(IpcEvents.SET_SETTINGS, (_, s) => void writeFile(SETTINGS_FILE, s));
ipcMain.handle(IpcEvents.OPEN_PATH, (_, path) => shell.openPath(path));
ipcMain.handle(IpcEvents.OPEN_EXTERNAL, (_, url) => shell.openExternal(url));

export function initIpc(mainWindow: BrowserWindow) {
    open(QUICKCSS_PATH, "a+").then(fd => {
        fd.close();

        watch(QUICKCSS_PATH, async () => {
            mainWindow.webContents.postMessage(IpcEvents.QUICK_CSS_UPDATE, await readCss());
        });
    });
}