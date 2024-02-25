import definePlugin from '../utils/types';

export default definePlugin({
	name: "mutenewguild",
	description: "muta os servidores nos quais você se juntou recentemente",

	authors: [
		{
			name: "vuwints",
			id: 671809749955641364n
		}
	],

	patches: [
		{
			find: ",acceptInvite:function",

			replacement: {
				match: /(\w=null!==[^;]+)/,

				replace: "$1;Deimos.Webpack.findByProps('updateGuildNotificationSettings').updateGuildNotificationSettings($1,{'muted':true,'suppress_everyone':true,'suppress_roles':true})"
			}
		}
	]
});