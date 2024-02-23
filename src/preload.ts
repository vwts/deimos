import electron, {
    contextBridge,
    webFrame
} from 'electron';

import {
    readFileSync
} from 'fs';

import {
    join
} from 'path';

import {
	ipcRenderer
} from 'electron';

import DeimosNative from './DeimosNative';
import IpcEvents from './utils/IpcEvents';

if (electron.desktopCapturer === void 0) {
	// correção do desktopcapturer sendo main nos electron 17+
	// o discord acesso isso em discord_desktop_core (DiscordNative.desktopCapture.getDesktopCaptureSources)
	// e erros que não podem "ler a propriedade getSources() ou indefinida"
	//
	// veja discord_desktop_core/app/discord_native/renderer/desktopCapture.js
	const electronPath = require.resolve("electron");

	delete require.cache[electronPath]!.exports;

	require.cache[electronPath]!.exports = {
		...electron,

		desktopCapturer: {
			getSources: (opts) => ipcRenderer.invoke(IpcEvents.GET_DESKTOP_CAPTURE_SOURCES, opts)
		}
	};
}

contextBridge.exposeInMainWorld("DeimosNative", DeimosNative);

webFrame.executeJavaScript(readFileSync(join(__dirname, "renderer.js"), "utf-8"));

require(process.env.DISCORD_PRELOAD!);