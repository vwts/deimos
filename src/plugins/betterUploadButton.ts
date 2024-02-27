import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "betteruploadbutton",
	description: "posta imagem com apenas um clique, abre o menu com o clique direito",

	authors: [Devs.Vuw],

	patches: [
		{
			find: "Messages.CHAT_ATTACH_UPLOAD_OR_INVITE",

			replacement: {
				match: /CHAT_ATTACH_UPLOAD_OR_INVITE,onDoubleClick:([^,]+),onClick:([^,]+)}}/,

				replace: "CHAT_ATTACH_UPLOAD_OR_INVITE,onClick:$1,onContextMenu:$2}}"
			}
		}
	]
});