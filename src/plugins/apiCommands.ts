import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "commandsapi",
	description: "api necessária por qualquer coisa que utilize comandos",

	authors: [Devs.Vuw],

	patches: [
		{
			find: '"giphy","tenor"',

			replacement: [
				{
					// coincide com built_in_commands.
					match: /(?<=\w=)(\w)(\.filter\(.{0,30}giphy)/,

                    replace: "Deimos.Api.Commands._init($1)$2"
				}
			]
		}
	]
});