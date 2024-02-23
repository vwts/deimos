import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "NoTrack",
    description: "desabilita todos os tracks e reports de crash do discord",

	authors: [Devs.Vuw],

    required: true,

    patches: [
        {
            find: "TRACKING_URL:",

            replacement: {
                match: /^.+$/,

                replace: "()=>{}"
            }
        },

        {
            find: "window.DiscordSentry=",

            replacement: {
                match: /window\.DiscordSentry=function.+}\(\)/,

                replace: ""
            }
        }
    ]
});