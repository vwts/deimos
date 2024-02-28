import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "isstaff",
	description: "dá acesso aos devtools do client + outras coisas trancadas pelo isstaff",

	authors: [Devs.Vuw],

	patches: [
		{
			find: ".isStaff=function(){",

            replacement: [
                {
                    match: /return\s*(\w+)\.hasFlag\((.+?)\.STAFF\)}/,

                    replace: "return Deimos.Webpack.Common.UserStore.getCurrentUser().id===$1.id||$1.hasFlag($2.STAFF)}"
                },

                {
                    match: /hasFreePremium=function\(\){return this.isStaff\(\)\s*\|\|/,

                    replace: "hasFreePremium=function(){return "
                }
            ]
		}
	]
});