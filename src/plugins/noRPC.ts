import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "no rpc",
	description: "desabilita o servidor rpc do discord",

	authors: [Devs.Vuw],

	patches: [
		{
			find: '.ensureModule("discord_rpc")',

			replacement: {
				match: /\.ensureModule\("discord_rpc"\)\.then\(\(.+?\)\)}/,

				replace: '.ensureModule("discord_rpc")}'
			}
		}
	]
});