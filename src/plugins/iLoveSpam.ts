import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "ilovespam",
	description: "não esconde mensagens dos suspeitos de spam",

	authors: [Devs.Vuw],

	patches: [
		{
			find: "),{hasFlag:",

			replacement: {
				match: /(if\((.{1,2})<=1<<30\)return)/,

				replace: "if($2===(1<<20)){return false};$1"
			}
		}
	]
});