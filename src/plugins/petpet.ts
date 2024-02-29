import {
	ApplicationCommandOptionType,
	findOption,
	ApplicationCommandInputType,
	Argument,
	CommandContext
} from '../api/Commands';

import {
	Devs
} from '../utils/constants';

import {
	lazy,
	lazyWebpack,
	suppressErrors
} from '../utils/misc';

import {
	filters
} from '../webpack';

import definePlugin from '../utils/types';

const DRAFT_TYPE = 0;
const DEFAULT_DELAY = 20;
const DEFAULT_RESOLUTION = 128;
const FRAMES = 10;

// https://github.com/mattdesl/gifenc

// essa biblioteca é bem melhor que o gif.js e todas as outras bibliotecas
// elas são tão terríveis, mas essa aqui em si é boa

// @ts-ignore mal ts
const getGifEncoder = lazy(() => import("https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js"));

const getFrames = lazy(() => Promise.all(
	Array.from(
		{
			length: FRAMES
		},

		(_, i) => loadImage(`https://raw.githubusercontent.com/VenPlugs/petpet/main/frames/pet${i}.gif`)
	)
));

const fetchUser = lazyWebpack(filters.byCode(".USER("));
const promptToUpload = lazyWebpack(filters.byCode("UPLOAD_FILE_LIMIT_ERROR"));
const UploadStore = lazyWebpack(filters.byProps(["getUploads"]));

function loadImage(source: File | string) {
	const isFile = source instanceof File;
	const url = isFile ? URL.createObjectURL(source) : source;

	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			if (isFile)
				URL.revokeObjectURL(url);

			resolve(img);
		};

		img.onerror = reject;
        img.crossOrigin = "Anonymous";
        img.src = url;
	});
}

async function resolveImage(options: Argument[], ctx: CommandContext): Promise<File | string | null> {
	for (const opt of options) {
		switch (opt.name) {
			case "image":
				const upload = UploadStore.getUploads(ctx.channel.id, DRAFT_TYPE)[0];

				if (upload) {
					if (!upload.isImage)
						throw "upload não é uma imagem";

					return upload.item.file;
				}

				break;

			case "url":
				return opt.value;

			case "user":
				try {
					const user = await fetchUser(opt.value);

                    return user.getAvatarURL(ctx.guild, 2048).replace(/\?size=\d+$/, "?size=2048");
				} catch (err) {
					console.error("[petpet] falha ao capturar usuário\n", err);

					throw "falha ao capturar usuário. veja o console para mais informações.";
				}
		}
	}

	return null;
}

export default definePlugin({
	name: "petpet",
	description: "petpet",

	authors: [Devs.Vuw],

	dependencies: ["CommandsAPI"],

	commands: [
		{
			inputType: ApplicationCommandInputType.BUILT_IN,
			name: "petpet",
			description: "cria um gif petpet. você pode apenas especificar uma das opções de imagem",

			options: [
				{
					name: "delay",
					description: "o delay entre cada frame. padrão é 20.",

					type: ApplicationCommandOptionType.INTEGER
				},

				{
					name: "resolution",
					description: "resolução para o gif. padrão é 120. se você inserir um número insano e congelar o discord a culpa é sua.",

					type: ApplicationCommandOptionType.INTEGER
				},

				{
					name: "image",
					description: "anexo de imagem para uso",

					type: ApplicationCommandOptionType.ATTACHMENT
				},

				{
					name: "url",
					description: "url para capturar a imagem",

					type: ApplicationCommandOptionType.STRING
				},

				{
					name: "user",
					description: "usuário no qual a imagem será utilizada a partir do avatar",

					type: ApplicationCommandOptionType.USER
				}
			],

			execute: suppressErrors("petpetExecute", async (opts, cmdCtx) => {
				const {
					GIFEncoder,
					quantize,
					applyPalette
				} = await getGifEncoder();

				const frames = await getFrames();

				try {
					var url = await resolveImage(opts, cmdCtx);

					if (!url)
						throw "nenhuma imagem especificada!";
				} catch (err) {
					// todo fazer isso enviar uma mensagem clyde cada vez que um pull request for feito

					console.log(err);

					return;
				}

				const avatar = await loadImage(url);

                const delay = findOption(opts, "delay", DEFAULT_DELAY);
                const resolution = findOption(opts, "resolution", DEFAULT_RESOLUTION);

                const gif = new GIFEncoder();

                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = resolution;
                const ctx = canvas.getContext("2d")!;

				for (let i = 0; i < FRAMES; i++) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					const j = i < FRAMES / 2 ? i : FRAMES - i;
                    const width = 0.8 + j * 0.02;
                    const height = 0.8 - j * 0.05;
                    const offsetX = (1 - width) * 0.5 + 0.1;
                    const offsetY = 1 - height - 0.08;

					ctx.drawImage(avatar, offsetX * resolution, offsetY * resolution, width * resolution, height * resolution);
                    ctx.drawImage(frames[i], 0, 0, resolution, resolution);

                    const {
						data
					} = ctx.getImageData(0, 0, resolution, resolution);

                    const palette = quantize(data, 256);
                    const index = applyPalette(data, palette);

                    gif.writeFrame(index, resolution, resolution, {
                        transparent: true,
                        palette,
                        delay
                    });
				}

				gif.finish();

				const file = new File([gif.bytesView()], "petpet.gif", {
					type: "image/gif"
				});

				setImmediate(() => promptToUpload([file], cmdCtx.channel, DRAFT_TYPE));
			})
		}
	]
});