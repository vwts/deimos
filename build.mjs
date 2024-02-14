#!/usr/bin/node

import esbuild from 'esbuild';

import {
    readdirSync
} from 'fs';

import {
    performance
} from 'perf_hooks';

/**
 * @type {esbuild.WatchMode|false}
 */
const watch = process.argv.includes("--watch") ? {
    onRebuild: (err) => {
        if (err) console.error("erro de build", err.message);

        else console.log("reconstruído!");
    }
} : false;

// https://github.com/evanw/esbuild/issues/619#issuecomment-751995294

/**
 * @type {esbuild.Plugin}
 */
const makeAllPackagesExternalPlugin = {
    name: 'make-all-packages-external',

    setup(build) {
        let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;

        build.onResolve({ filter }, args => ({
            path: args.path,
            external: true
        }));
    }
};

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
            const files = readdirSync("./src/plugins");

            let code = "";
            let arr = "[";

            for (let i = 0; i < files.length; i++) {
                if (files[i] === "index.ts") {
                    continue;
                }

                const mod = `__pluginMod${i}`;

                code += `import ${mod} from "./${files[i].replace(".ts", "")}";\n`;
                arr += `${mod},`;
            }

            code += `export default ${arr}]`;

            return {
                contents: code,
                resolveDir: "./src/plugins"
            };
        });
    }
};

const begin = performance.now();

await Promise.all([
    esbuild.build({
        entryPoints: ["src/preload.ts"],
        outfile: "dist/preload.js",
        format: "cjs",
        bundle: true,
        platform: "node",
        target: ["esnext"],
        plugins: [makeAllPackagesExternalPlugin],
        watch
    }),

    esbuild.build({
        entryPoints: ["src/patcher.ts"],
        outfile: "dist/patcher.js",
        bundle: true,
        format: "cjs",
        target: ["esnext"],
        external: ["electron"],
        platform: "node",
        plugins: [makeAllPackagesExternalPlugin],
        watch
    }),

    esbuild.build({
        entryPoints: ["src/Deimos.ts"],
        outfile: "dist/renderer.js",
        format: "iife",
        bundle: true,
        target: ["esnext"],
        footer: { js: "//# sourceURL=DeimosRenderer" },
        globalName: "Deimos",
        external: ["plugins"],
        plugins: [
            globPlugins
        ],
        watch
    })
]).then(res => {
    const took = performance.now() - begin;

    console.log(`construído em ${took.toFixed(2)}ms`);
}).catch(err => {
    console.error("construção falhou");

    console.error(err.message);
});

if (watch) console.log("observando...");