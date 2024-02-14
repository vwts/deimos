import {
    contextBridge,
    webFrame
} from 'electron';

import {
    readFileSync
} from 'fs';

import {
    join
} from 'path';

import Deimos from './Deimos';

contextBridge.exposeInMainWorld("DeimosNative", {
    getSettings: () => "olá"
});

webFrame.executeJavaScript(readFileSync(join(__dirname, "renderer.js"), "utf-8"));

require(process.env.DISCORD_PRELOAD!);

window.onload = () => console.log("olá");