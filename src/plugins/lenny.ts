import {
	Devs
} from '../utils/constants';

import {
	findOption,
	OptionalMessageOption
} from '../api/Commands';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "lenny",
	description: "( ͡° ͜ʖ ͡°)",

	authors: [Devs.Vuw],

	dependencies: ["CommandsAPI"],

	commands: [
		{
			name: "lenny",
			description: "envia uma face lenny ( ͡° ͜ʖ ͡°)",

			options: [OptionalMessageOption],

			execute: (opts) => ({
				content: findOption(opts, "message", "") + " ( ͡° ͜ʖ ͡°)"
			})
		}
	]
});