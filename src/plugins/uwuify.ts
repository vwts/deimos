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
		.map(w => {
			let owofied = false;

			let lowerCase = w.toLowerCase();

			// retorna se a palavra for curta demais
			if (w.length < 4) {
				return w;
			}

			// substituindo as palavras baseado no array da linha 33
			for (let [find, replace] of words) {
				if (w.includes(find)) {
					w = w.replace(find, replace);

					owofied = true;
				}
			}

			// as mudanças mais significativas das palavras
			if (lowerCase.includes("u") && !lowerCase.includes("uwu")) {
                w = w.replace("u", "UwU");

                owofied = true;
            }

            if (lowerCase.includes("o") && !lowerCase.includes("owo")) {
                w = w.replace("o", "OwO");

                owofied = true;
            }

            if (lowerCase.endsWith("y") && w.length < 7) {
                w = w + " " + "w" + w.slice(1);

                owofied = true;
            }

			// retornando se a palavra já foi mudada com a função uwu
			if (owofied) {
				return w;
			}

			// mais algumas mudanças mínimas - manter essas palavras que passam pelas mudanças latter
			if (!lowerCase.endsWith("n")) {
                w = w.replace("n", "ny");
            }

            if (Math.floor(Math.random() * 2) == 1) {
                w.replace("s", "sh");
            }

            if (Math.floor(Math.random() * 5) == 3 && !owofied) {
                w = w[0] + "-" + w[0] + "-" + w;
            }

            if (Math.floor(Math.random() * 5) == 3) {
                w = w + " " + endings[Math.floor(Math.random() * endings.length)];
            }

            w = w.replaceAll("r", "w").replaceAll("l", "w");

            return w;
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