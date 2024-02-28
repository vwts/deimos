import {
	ApplicationCommandOptionType
} from '../api/Commands';

import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

const sound = {
	fart: new Audio("https://raw.githubusercontent.com/ItzOnlyAnimal/AliuPlugins/main/fart.mp3")
};

export default definePlugin({
	name: "fart2",
	description: "habilita o farting v2, um comando slash que permite performar ou solicitar que alguém performou um pequeno toot.",

	authors: [Devs.Vuw],

	dependencies: ["CommandsAPI"],

	commands: [
		{
			name: "fart",
			description: "um comando simples que você pode solicitar que o usuário faça um pequeno toot para você.",

			options: [
				{
					type: ApplicationCommandOptionType.USER,
					name: "usuário",
					description: "um usuário discord",

					required: false
				}
			],

			execute(args) {
				sound.fart.volume = 0.3;
				sound.fart.play();

				return {
					content: (args[0]) ? `<@${args[0].value}> fart` : "fart"
				};
			}
		}
	]
});