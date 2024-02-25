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
                    match: /(\w+)\.isStaff=function\(\){return\s*!1};/,

                    replace: "$1.isStaff=function(){return true};",
                },

                {
                    match: /return\s*\w+\.hasFlag\(.+?STAFF\)}/,

                    replace: "return true}",
                },

                {
                    match: /hasFreePremium=function\(\){return this.isStaff\(\)\s*\|\|/,

                    replace: "hasFreePremium=function(){return ",
                }
            ]
		}
	]
});