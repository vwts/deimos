import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "STFU",
    description: "desabilita o banner de 'HOLD UP' no console",

    authors: [Devs.Vuw],

    patches: [
        {
            find: "setDevtoolsCallbacks",

            replacement: {
                match: /if\(.{0,10}\|\|"0.0.0"!==.{0,2}\.remoteApp\.getVersion\(\)\)/,

                replace: "if(false)"
            }
        }
    ]
});