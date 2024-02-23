import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "plainfoldericon",
	description: "não mostra os ícones dos servidores dentro de suas pastas",

	authors: [Devs.Vuw],

	patches: [
		{
			find: "().expandedFolderIconWrapper",

			replacement: [
				{
					match: /\(\w\|\|\w\)(&&\(\w=\w\.createElement\(\w+\.animated)/,

					replace: "true$1"
				}
			]
		}
	]
});