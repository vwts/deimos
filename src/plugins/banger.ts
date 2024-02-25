import definePlugin from '../utils/types';

export default definePlugin({
    name: "banger",
    description: "substitui o gif do diálogo de ban para um customizado",

    authors: [
		{
			name: "vuwints",
			id: 671809749955641364n
		}
	],

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