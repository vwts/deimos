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
                match: /\.setDevtoolsCallbacks\(.+?else/,

                replace: ".setDevtoolsCallbacks(null,null);else"
            }
        }
    ]
});