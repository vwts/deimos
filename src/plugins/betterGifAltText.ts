import definePlugin from '../utils/types';

export default definePlugin({
	name: "bettergifalttext",
	description: "altera o texto alt de um gif",
	author: "vuwints",

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

		const url = props.original || props.src;

		const name = url
			.slice(url.lastIndexOf("/") + 1)

			.replace(/\d/g, "") // strip números
			.replace(/.gif$/, "") // strip extensão
			.replace(/[,-_ ]+/g, " "); // substitui os delimitadores padrões com espaço

		if (name.length)
			props.alt += ` - ${name}`;

		return props.alt;
	}
});