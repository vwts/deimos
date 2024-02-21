import {
	Toasts
} from '../webpack/common';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "clickableroledot",
	description: "faz com que os roledots (recurso de acessibilidade), copie as cores para o clipboard ao clicar",
	author: "vuwints",

	patches: [
		{
			find: "M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z",

			replacement: {
				match: /(viewBox:"0 0 20 20")/,

				replace: "$1,onClick:()=>Deimos.Plugins.plugins.ClickableRoleDot.copyToClipBoard(e.color)"
			}
		}
	],

	copyToClipboard(color: string) {
		DiscordNative.clipboard.copy(color);

		Toasts.show({
			message: "copiado para área de transferência!",

			type: Toasts.Type.SUCCESS,
			id: Toasts.genId(),

			options: {
				duration: 1000,

				position: Toasts.Position.BOTTOM
			}
		});
	}
});