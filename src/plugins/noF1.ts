import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "no f1",
	description: "desabilita o guia de ajuda do f1",

	authors: [Devs.Vuw],

	patches: [
		{
			find: ',"f1"],comboKeysBindGlobal:',

			replacement: {
				match: ',"f1"],comboKeysBindGlobal:',

				replace: "],comboKeysBindGlobal:"
			}
		}
	]
});