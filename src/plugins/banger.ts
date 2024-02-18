import definePlugin from '../utils/types';

export default definePlugin({
    name: "banger",
    description: "substitui o gif do diálogo de ban para um customizado",
    author: "vuwints",

    patches: [
        {
            find: "BanConfirm",

            replacement: {
                match: /src:\w\(\d+\)/g,

                replace: 'src: "https://i.imgur.com/wp5q52C.mp4"'
            }
        }
    ]
});