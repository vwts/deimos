import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "silenttyping",
	description: "oculta que você está digitando",

	authors: [Devs.Vuw],

	patches: [
		{
			find: "startTyping:",

			replacement: {
				match: /startTyping:.+?,stop/,

            	replace: "startTyping:()=>{},stop"
			}
		}
	]
});