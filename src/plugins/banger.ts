import {
	Devs
} from '../utils/constants';

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
            find: "BAN_CONFIRM_TITLE.",

            replacement: {
                match: /src:\w\(\d+\)/g,

                replace: 'src: "https://i.imgur.com/wp5q52C.mp4"'
            }
        }
    ]
});