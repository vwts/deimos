import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "bettergifalttext",
	description: "altera o texto alt de um gif",

	authors: [Devs.Vuw],

	patches: [
		{
			find: "onCloseImage=",

			replacement: {
				match: /(return .{1,2}\.createElement.{0,50}isWindowFocused)/,

				replace: "Deimos.Plugins.plugins.BetterGifAltText.altify(e);$1"
			}
		},

		{
			find: 'preload:"none","aria',

			replacement: {
				match: /\?.{0,5}\.Messages\.GIF/,

				replace: "?(e.alt='GIF',Deimos.Plugins.plugins.BetterGifAltText.altify(e))"
			}
		}
	],

	altify(props: any) {
		if (props.alt !== "GIF")
			return;

		let url: string = props.original || props.src;

		try {
			url = decodeURI(url);
		} catch {};

		let name = url
			.slice(url.lastIndexOf("/") + 1)

			.replace(/\d/g, "") // strip números
			.replace(/.gif$/, "") // strip extensão

			.split(/[,\-_ ]+/g)
            .slice(0, 20)
            .join(" ");

		if (name.length > 300) {
			name = name.slice(0, 300) + "...";
		}

		if (name)
			props.alt += ` - ${name}`;

		return props.alt;
	}
});