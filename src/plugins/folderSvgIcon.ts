import definePlugin from '../utils/types';

export default definePlugin({
	name: "ícone svg de pastas",
	description: "não mostra os ícones dos servidores dentro de suas pastas",
	author: "vuwints",

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