import definePlugin from '../utils/types';

export default definePlugin({
    name: "STFU",
    description: "aviso comprido desabilitado no console de devtools",
    author: "vuwints",

    start() {
        window.DiscordNative.window.setDevtoolsCallbacks(null, null);
    }
});