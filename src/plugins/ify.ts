import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "ify",
    description: "desabilita auto-pausa e checks de premium do spotify",

    authors: [Devs.Vuw],

    patches: [
        {
            find: '.displayName="SpotifyStore"',

			replacement: [
				{
					match: /\.isPremium=.;/,

					replace: ".isPremium=true;"
				},

				{
					match: /function (.{1,2})\(\).{0,200}SPOTIFY_AUTO_PAUSED\);.{0,}}}}/,

					replace: "function $1(){}"
				}
			]
		}
    ]
});