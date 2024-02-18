import definePlugin from '../utils/types';

export default definePlugin({
    name: "cumcord",
    description: "carrega o cumcord. é isso.",
    author: "vuwints",

    async start() {
        const cum = await fetch("https://raw.githubusercontent.com/Cumcord/Cumcord/stable/dist/build.js");

        (0, eval)(await cum.text());
    },

    stop() {
        window.cumcord?.uninject();
    }
});