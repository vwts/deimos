import definePlugin from '../utils/types';

export default definePlugin({
    name: "Experiments",
    description: "habilita os experimentos",
    author: "vuwints",

    patches: [{
        find: "Object.defineProperties(this,{isDeveloper",

        replacement: {
            match: /(?<={isDeveloper:\{[^}]+,get:function\(\)\{return )\w/,

            replace: "true"
        }
    }]
});