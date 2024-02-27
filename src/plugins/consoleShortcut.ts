import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

const WEB_ONLY = (f: string) => () => {
	throw new Error(`'${f}' funciona apenas para o discord desktop.`);
};

export default definePlugin({
	name: "consoleshurtcuts",
	description: "adiciona aliases curtos para várias coisas na janela. rode `shortcutList` para uma lista.",

	authors: [Devs.Vuw],

	getShortcuts() {
		return {
			toClip: IS_WEB ? WEB_ONLY("toClip") : window.DiscordNative.clipboard.copy,
            fromClip: IS_WEB ? WEB_ONLY("fromClip") : window.DiscordNative.clipboard.read,

            wp: Deimos.Webpack,
            wpc: Deimos.Webpack.wreq.c,
            wreq: Deimos.Webpack.wreq,

            wpsearch: Deimos.Webpack.search,
            wpex: Deimos.Webpack.extract,
            findByProps: Deimos.Webpack.findByProps,
            find: Deimos.Webpack.find,

            Plugins: Deimos.Plugins,
            React: Deimos.Webpack.Common.React,
            Settings: Deimos.Settings,
            Api: Deimos.Api,

            reload: () => location.reload(),
            restart: IS_WEB ? WEB_ONLY("restart") : window.DiscordNative.app.relaunch
		};
	},

	start() {
		const shortcuts = this.getShortcuts();

		window.shortcutList = shortcuts;

		for (const [key, val] of Object.entries(shortcuts))
			window[key] = val;
	},

	stop() {
		delete window.shortcutList;

        for (const key in this.getShortcuts())
            delete window[key];
	}
});