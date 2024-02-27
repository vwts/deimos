// todo: modularizar esses plugins até que sejam utilizados

import {
	execSync
} from 'child_process';

import {
	createWriteStream,
	readdirSync
} from 'fs';

import yazl from 'yazl';
import esbuild from 'esbuild';

/**
 * @type {esbuild.Plugin}
 */
const globPlugins = {
	name: "glob-plugins",

	setup: build => {
		build.onResolve({ filter: /^plugins$/ }, args => {
			return {
				namespace: "import-plugins",

				path: args.path
			};
		});

		build.onLoad({ filter: /^plugins$/, namespace: "import-plugins" }, () => {
			const files = readdirSync('./src/plugins');

			let code = "";
			let obj = "";

			for (let i = 0; i < files.length; i++) {
				if (files[i] === "index.ts") {
					continue;
				}

				const mod = `__pluginMod${i}`;

				code += `import ${mod} from "./${files[i].replace(/.tsx?$/, "")}";\n`;
                obj += `[${mod}.name]: ${mod},`;
			}

			code += `export default {${obj}}`;

			return {
				contents: code,

				resolveDir: './src/plugins'
			};
		});
	}
};

const gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();

/**
 * @type {esbuild.Plugin}
 */
const gitHashPlugin = {
	name: "git-hash-plugin",

	setup: build => {
		const filter = /^git-hash$/;

		build.onResolve({ filter }, args => ({
            namespace: "git-hash", path: args.path
        }));

        build.onLoad({ filter, namespace: "git-hash" }, () => ({
            contents: `export default "${gitHash}"`
        }));
	}
};

await esbuild.build({
	logLevel: "info",
    entryPoints: ["browser/Deimos.ts"],
    outfile: "dist/browser.js",
    format: "iife",
    bundle: true,
    globalName: "Deimos",

    target: ["esnext"],

    footer: {
		js: "//# sourceURL=DeimosWeb"
	},

    external: [
		"plugins",
		"git-hash"
	],

    plugins: [
        globPlugins,
        gitHashPlugin
    ],

    sourcemap: false,
    minify: true
});

const zip = new yazl.ZipFile();

zip.outputStream.pipe(createWriteStream("dist/extension.zip")).on("close", () => {
    console.info("extensão escrita em dist/extension.zip");
});

zip.addFile("dist/browser.js", "dist/Vencord.js");

["background.js", "content.js", "manifest.json"].forEach(f => {
    zip.addFile(`browser/${f}`, `${f}`);
});

zip.end();