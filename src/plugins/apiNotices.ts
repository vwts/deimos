import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "apinotices",
	description: "corrige atualização automática das notícias",

	authors: [Devs.Vuw],

	required: true,

	patches: [
		{
			find: "updateNotice:",

			replacement: [
				{
					match: /;(.{1,2}=null;)(?=.{0,50}updateNotice)/g,

					replace: ";if(Deimos.Api.Notices.currentNotice)return !1;$1"
				},

				{
					match: /(?<=NOTICE_DISMISS:function.+?){(?=if\(null==(.+?)\))/,

					replace: '{if($1?.id=="DeimosNotice")return ($1=null,Deimos.Api.Notices.nextNotice(),true);'
				}
			]
		}
	]
});