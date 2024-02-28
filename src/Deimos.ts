export * as Plugins from './plugins';
export * as Webpack from './webpack';
export * as Api from './api';
export * as Updater from './utils/updater';
export * as QuickCss from './utils/quickCss';

import {
	popNotice,
	showNotice
} from './api/Notices';

import {
	Settings
} from './api/settings';

import {
	startAllPlugins
} from './plugins';

export { Settings };

import {
	checkForUpdates,
	UpdateLogger
} from './utils/updater';

import {
	onceReady
} from './webpack';

import {
	Router
} from './webpack/common';

import './webpack/patchWebpack';
import './utils/quickCss';

Object.defineProperty(window, "IS_WEB", {
	get: () => !window.DiscordNative,

	configurable: true,
	enumerable: true
});

export let Components: any;

async function init() {
	await onceReady;

	startAllPlugins();

	Components = await import('./components');

	try {
		const isOutdated = await checkForUpdates();

		if (isOutdated && Settings.notifyAboutUpdates)
			setTimeout(() => {
				showNotice(
					"uma atualização deimos está disponível!",

					"ver atualização",

					() => {
						popNotice();

						Router.open("DeimosUpdater");
					}
				);
			}, 10000);
	} catch (err) {
		UpdateLogger.error("erro ao checar por atualizações", err);
	}
}

init();