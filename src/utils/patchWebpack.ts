import { WEBPACK_CHUNK } from './constants';

let webpackChunk: any[];

Object.defineProperty(window, WEBPACK_CHUNK, {
    get: () => webpackChunk,

    set: (v) => {
        // dois possíveis valores para push
        // - push nativo
        // - push do webpack

        if (v && !v.push.toString().includes("push")) {
            patchPush();

            // @ts-ignore
            delete window[WEBPACK_CHUNK];

            window[WEBPACK_CHUNK] = v;
        }

        webpackChunk = v;
    },

    configurable: true
});

function patchPush() {
    function handlePush(chunk) {
        try {
            const modules = chunk[1];
            const subscriptions = new Set<any>();
            const patches = [] as any[];

            for (const id in modules) {
                let mod = modules[id];
                let code = mod.toString();

                const originalMod = mod;
                const patchedBy = new Set();

                modules[id] = function (module, exports, require) {
                    try {
                        mod(module, exports, require);
                    } catch (err) {
                        // erros do discord
                        if (mod === originalMod) throw err;

                        console.error("[webpack] erro no chunk patchado", err);

                        return originalMod(module, exports, require);
                    }

                    for (const [filter, callback] of subscriptions) {
                        try {
                            if (filter(exports)) {
                                subscriptions.delete(filter);

                                callback(exports);
                            } else if (exports.default && filter(exports.default)) {
                                subscriptions.delete(filter);

                                callback(exports.default);
                            }
                        } catch (err) {
                            console.error("[webpack] erro ao tentar chamar pelo callback para o chunk do webpack", err);
                        }
                    }
                };

                for (let i = 0; i < patches.length; i++) {
                    const patch = patches[i];

                    if (code.includes(patch.find)) {
                        patchedBy.add(patch.plugin);

                        const lastMod = mod;
                        const lastCode = code;

                        try {
                            const newCode = code.replace(patch.replacement.match, patch.replacement.replace);
                            const newMod = (0, eval)(`// módulo webpack ${id} - patchado por ${[...patchedBy].join(", ")}\n${newCode}\n//# sourceURL=WebpackModule${id}`);

                            code = newCode;
                            mod = newMod;

                            patches.splice(i--, 1);
                        } catch (err) {
                            console.error("", patch.plugin, err);

                            code = lastCode;
                            mod = lastMod;

                            patchedBy.delete(patch.plugin);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("oopsie", err);
        }

        return handlePush.original.call(window[WEBPACK_CHUNK], chunk);
    }

    handlePush.original = window[WEBPACK_CHUNK].push;

    Object.defineProperty(window[WEBPACK_CHUNK], "push", {
        get: () => handlePush,

        set: (v) => (handlePush.original = v),

        configurable: true
    });
}