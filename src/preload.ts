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

import DeimosNative from './DeimosNative';

contextBridge.exposeInMainWorld("DeimosNative", DeimosNative);

webFrame.executeJavaScript(readFileSync(join(__dirname, "renderer.js"), "utf-8"));

require(process.env.DISCORD_PRELOAD!);