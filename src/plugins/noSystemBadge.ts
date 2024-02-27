import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "nosystembadge",
	description: "desabilita a contagem de badges da barra de tarefas e systemtray",

	authors: [Devs.Vuw],

	patches: [
		{
			find: "setSystemTrayApplications:function",

			replacement: [
				{
					match: /setBadge:function.+?},/,

					replace: "setBadge:function(){},"
				},

				{
					match: /setSystemTrayIcon:function.+?},/,

                    replace: "setSystemTrayIcon:function(){},"
				}
			]
		}
	]
});