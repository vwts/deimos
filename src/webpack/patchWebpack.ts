import {
	WEBPACK_CHUNK
} from '../utils/constants';

import {
	_initWebpack
} from '.';

import Logger from '../utils/logger';

let webpackChunk: any[];

const logger = new Logger("WebpackInterceptor", "#8caaee");

Object.defineProperty(window, WEBPACK_CHUNK, {
	get: () => webpackChunk,

	set: v => {
		if (v?.push !== Array.prototype.push) {
			logger.info(`instalando ${WEBPACK_CHUNK}.push`);

			_initWebpack(v);

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

			const {
				subscriptions,
				listeners
			} = Deimos.Webpack;

			const {
				patches
			} = Deimos.Plugins;

			for (const id in modules) {
				let mod = modules[id];

				// chunks do webpack do discord contém newlines aleatórias
				let code = mod.toString().replaceAll("\n", "");

				const originalMod = mod;
				const patchedBy = new Set();

				modules[id] = function (module, exports, require) {
					try {
						mod(module, exports, require);
					} catch (err) {
						// apenas re-lançar erros do discord
						if (mod === originalMod)
							throw err;

						logger.error("erro no chunk corrigido", err);

						return originalMod(module, exports, require);
					}

					// 11 módulos exportando a janela
					// torná-los não-enumeráveis para melhorar performance de busca do webpack
					if (module.exports === window) {
						Object.defineProperty(require.c, id, {
							value: require.c[id],
							enumerable: false,
                            configurable: true,
                            writable: true
						});

						return;
					}

					for (const callback of listeners) {
                        try {
                            callback(exports);
                        } catch (err) {
                            logger.error("erro no ouvinte de wepback", err);
                        }
                    }

					for (const [filter, callback] of subscriptions) {
                        try {
                            if (filter(exports)) {
                                subscriptions.delete(filter);

                                callback(exports);
                            } else if (typeof exports === "object") {
                                if (exports.default && filter(exports.default)) {
                                    subscriptions.delete(filter);

                                    callback(exports.default);
                                }

                                for (const nested in exports) if (nested.length < 3) {
                                    if (exports[nested] && filter(exports[nested])) {
                                        subscriptions.delete(filter);

                                        callback(exports[nested]);
                                    }
                                }
                            }
                        } catch (err) {
                            logger.error("erro ao disparar retorno de chamada para chunk do webpack", err);
                        }
                    }
				};

				modules[id].toString = () => mod.toString();
                modules[id].original = originalMod;

				for (let i = 0; i < patches.length; i++) {
					const patch = patches[i];

					if (code.includes(patch.find)) {
						patchedBy.add(patch.plugin);

						// @ts-ignore
						for (const replacement of patch.replacement) {
							const lastMod = mod;
							const lastCode = code;

							try {
								const newCode = code.replace(replacement.match, replacement.replace);

								if (newCode === code) {
									logger.warn(`patch de ${patch.plugin} não teve efeitos: ${replacement.match}`);

									logger.debug("fonte da função:\n", code);
								} else {
									code = newCode;

									mod = (0, eval)(`// módulo webpack ${id} - patched por ${[...patchedBy].join(", ")}\n${newCode}\n//# sourceURL=WebpackModule${id}`);
								}
							} catch (err) {
								// todo - erros mais úteis
								logger.error("falha ao aplicar patch de", patch.plugin, err);
                                logger.debug("fonte original\n", lastCode);
                                logger.debug("fonte patched\n", code);

								code = lastCode;
                                mod = lastMod;

                                patchedBy.delete(patch.plugin);
							}
						}

						patches.splice(i--, 1);
					}
				}
			}
		} catch (err) {
			logger.error("oopsie", err);
		}

		return handlePush.original.call(window[WEBPACK_CHUNK], chunk);
	}

	handlePush.original = window[WEBPACK_CHUNK].push;

	Object.defineProperty(window[WEBPACK_CHUNK], "push", {
		get: () => handlePush,

		set: v => (handlePush.original = v),

		configurable: true
	});
}