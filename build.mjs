#!/usr/bin/node

import esbuild from 'esbuild';

await Promise.all([
    esbuild.build({
        entryPoints: ["src/preload.ts"],
        outfile: "dist/preload.js",
        format: "cjs",
        treeShaking: true,
        platform: "node",
        target: ["esnext"]
    }),

    esbuild.build({
        entryPoints: ["src/patcher.ts"],
        outfile: "dist/patcher.js",
        format: "cjs",
        target: ["esnext"],
        platform: "node"
    }),

    esbuild.build({
        entryPoints: ["src/Deimos.ts"],
        outfile: "dist/renderer.js",
        format: "iife",
        bundle: true,
        target: ["esnext"],
        footer: { js: "//# sourceURL=DeimosRenderer" },
        globalName: "Deimos"
    })
]);

console.log("construído!");