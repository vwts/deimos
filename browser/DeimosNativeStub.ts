import IpcEvents from '../src/utils/IpcEvents';

// discord deleta isso, então armazenar em variável
var { localStorage } = window;

const handlers = {
	[IpcEvents.GET_REPO]: () => "", // todo
	[IpcEvents.GET_SETTINGS_DIR]: () => "LocalStorage",

	[IpcEvents.GET_QUICK_CSS]: () => localStorage.getItem("DeimosQuickCss"),
    [IpcEvents.GET_SETTINGS]: () => localStorage.getItem("DeimosSettings") || "{}",
    [IpcEvents.SET_SETTINGS]: (s: string) => localStorage.setItem("DeimosSettings", s),

	[IpcEvents.GET_UPDATES]: () => ({ ok: true, value: [] }),

    [IpcEvents.OPEN_EXTERNAL]: (url: string) => open(url, "_blank"),
    [IpcEvents.OPEN_QUICKCSS]: () => { } // todo
};

function onEvent(event: string, ...args: any[]) {
	const handler = handlers[event];

	if (!handler)
		throw new Error(`evento ${event} não implementado.`);

	return handler(...args);
}

window.DeimosNative = {
	getVersions: () => ({}),

	ipc: {
		send: (event: string, ...args: any[]) => void onEvent(event, ...args),

		sendSync: onEvent,

		on(event: string, listener: () => {}) {
			// todo quickcss
		},

		off(event: string, listener: () => {}) {
			// não utilizado por agora
		},

		invoke: (event: string, ...args: any[]) => Promise.resolve(onEvent(event, ...args))
	}
};