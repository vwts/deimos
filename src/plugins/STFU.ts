import definePlugin from '../utils/types';

export default definePlugin({
    name: "STFU",
    description: "desabilita o banner de 'HOLD UP' no console",
    author: "vuwints",

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