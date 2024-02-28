import {
	findOption,
	RequiredMessageOption
} from '../api/Commands';

import definePlugin from '../utils/types';

// palavras têm uma chance possuem uma chance de encerrarem com alguns desses ascii
const endings = [
	"owo",
    "UwU",
    ">w<",
    "^w^",
    "●w●",
    "☆w☆",
    "𝗨𝘄𝗨",
    "(ᗒᗨᗕ)",
    "(▰˘v˘▰)",
    "( ´ ▽ ` ).｡ｏ♡",
    "*unbuttons shirt*",
    ">3<",
    ">:3",
    ":3",
    "murr~",
    "♥(。U ω U。)",
    "(˘ε˘)",
    "*screams*",
    "*twerks*",
    "*sweats*"
];

// palavras de substituição
const words = [
	["love", "wuv"],
    ["mr", "mistuh"],
    ["dog", "doggo"],
    ["cat", "kitteh"],
    ["hello", "henwo"],
    ["hell", "heck"],
    ["fuck", "fwick"],
    ["fuk", "fwick"],
    ["shit", "shoot"],
    ["friend", "fwend"],
    ["stop", "stawp"],
    ["god", "gosh"],
    ["dick", "peepee"],
    ["penis", "bulge"],
    ["damn", "darn"]
];

// comando uwuify
function uwuify(message: string): string {
	let isowo = false;

	return message
		.split(" ")
		.map(element => {
			isowo = false;

			let lowerCase = element.toLowerCase();

			// retorna se a palavra for curta demais
			if (element.length < 4) {
				return element;
			}

			// substituindo as palavras baseado no array da linha 33
			for (let [find, replace] of words) {
				if (element.includes(find)) {
					element = element.replace(find, replace);

					isowo = true;
				}
			}

			// as mudanças mais significativas das palavras
			if (lowerCase.includes("u") && !lowerCase.includes("uwu")) {
                element = element.replace("u", "UwU");

                isowo = true;
            }

            if (lowerCase.includes("o") && !lowerCase.includes("owo")) {
                element = element.replace("o", "OwO");

                isowo = true;
            }

            if (lowerCase.endsWith("y") && element.length < 7) {
                element = element + " " + "w" + element.slice(1);

                isowo = true;
            }

			// retornando se a palavra já foi mudada com a função uwu
			if (isowo) {
				return element;
			}

			// mais algumas mudanças mínimas - manter essas palavras que passam pelas mudanças latter
			if (!lowerCase.endsWith("n")) {
                element = element.replace("n", "ny");
            }

            if (Math.floor(Math.random() * 2) == 1) {
                element.replace("s", "sh");
            }

            if (Math.floor(Math.random() * 5) == 3 && !isowo) {
                element = element[0] + "-" + element[0] + "-" + element;
            }

            if (Math.floor(Math.random() * 5) == 3) {
                element = element + " " + endings[Math.floor(Math.random() * endings.length)];
            }

            element = element.replace("r", "w").replace("l", "w");

            return element;
		}).join(" ");
}

// declaração de comando atual
export default definePlugin({
	name: "uwuifier",
	description: "comandos simplificados uwuify",

	authors: [
		{
			name: "vuwints",
			id: 671809749955641364n
		}
	],

	dependencies: ["CommandsAPI"],

	commands: [
		{
			name: "uwuify",
			description: "uwuza suas mensagens",

			options: [RequiredMessageOption],

			execute: opts => ({
				content: uwuify(findOption(opts, "message", ""))
			})
		}
	]
});