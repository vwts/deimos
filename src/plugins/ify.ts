import definePlugin from '../utils/types';

export default definePlugin({
    name: "ify",
    description: "desabilita auto-pausa e checks de premium do spotify",
    author: "vuwints",

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