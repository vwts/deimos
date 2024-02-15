import definePlugin from '../utils/types';

export default definePlugin({
    name: "ClientInfo",
    description: "adiciona informação extra para client info nas configurações",
    author: "vuwints",

    patches: [{
        find: "default.versionHash",

        replacement: {
            match: /\w\.createElement.+?["']Host ["'].+?\):null/,

            replace: m => {
                const idx = m.indexOf("Host") - 1;

                return `${m},${m.slice(0, idx)}"Deimos ".repeat(50),"1.0.0")," ")`;
            }
        }
    }]
});