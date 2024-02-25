import definePlugin from '../utils/types';

export default definePlugin({
	name: "randomisefilenames",
	description: "aleatoriza os nomes de arquivos postados",

	authors: [
		{
			name: "vuwints",
			id: 671809749955641364n
		}
	],

	patches: [
		{
			find: "instantBatchUpload:function",

			replacement: {
				match: /uploadFiles:(.{1,2}),/,

				replace: "uploadFiles:(...args)=>(args[0].uploads.forEach(f=>f.filename=Deimos.Plugins.plugins.RandomiseFileNames.rand(f.filename)),$1(...args)),"
			}
		}
	],

	rand(file) {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		const rand = Array.from(
			{
				length: 7
			},

			() => chars[Math.floor(Math.random() * chars.length)]
		).join("");

		return rand + window.DiscordNative.fileManager.extname(file);
	}
});