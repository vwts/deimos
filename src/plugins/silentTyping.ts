import definePlugin from '../utils/types';

export default definePlugin({
	name: "silenttyping",
	description: "oculta que você está digitando",
	author: "vuwints",

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