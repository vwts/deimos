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
				}, ...["SPEAKING", "VOICE_STATE_UPDATES", "MEDIA_ENGINE_SET_DESKTOP_SOURCE"].map(event => ({
					match: new RegExp(`${event}:function\\(.\\){.+?}(,|}\\))`),

					replace: (_, ending) => `${event}:function(){}${ending}`
				}))
			]
		}
    ]
});