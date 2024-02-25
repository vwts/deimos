import definePlugin from '../utils/types';

export default definePlugin({
	name: "noreplymention",
	description: "desabilita os pings de respostas por padrão",

	authors: [
		{
			name: "vuwints",
			id: 671809749955641364n
		}
	],

	patches: [
		{
			find: "CREATE_PENDING_REPLY:function",

			replacement: {
				match: /CREATE_PENDING_REPLY:function\((.{1,2})\){/,

				replace: "CREATE_PENDING_REPLY:function($1){$1.shouldMention=false;"
			}
		}
	]
})