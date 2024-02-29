import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "webhook tags",
	description: "",

	authors: [Devs.Vuw],

	patches: [
		{
			find: '.BOT=0]="BOT"',

			replacement: [
				{
					match: /(.)\[.\.BOT=0\]="BOT";/,

					replace: (orig, types) => `${types}[${types}.WEBHOOK=99]="WEBHOOK";${orig}`
				},

				{
					match: /case (.)\.BOT:default:(.)=/,

                    replace: (orig, types, text) => `case ${types}.WEBHOOK:${text}="WEBHOOK";break;${orig}`
				}
			]
		},

		{
			find: ".Types.ORIGINAL_POSTER",

            replacement: {
                match: /return null==(.)\?null:.\.createElement\((.)\.Z/,

                replace: (orig, type, BotTag) => `if(arguments[0].message.webhookId){${type}=${BotTag}.Z.Types.WEBHOOK}${orig}`
            }
		}
	]
});