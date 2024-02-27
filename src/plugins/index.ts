import Plugins from 'plugins';
import Logger from '../utils/logger';

import {
	registerCommand,
	unregisterCommand
} from '../api/Commands';

import {
    Settings
} from '../api/settings';

import {
    Patch,
    Plugin
} from '../utils/types';

const logger = new Logger("PluginManager", "#a6d189");

export const plugins = Plugins;
export const patches = [] as Patch[];

for (const plugin of Object.values(Plugins)) if (plugin.patches && Settings.plugins[plugin.name].enabled) {
    for (const patch of plugin.patches) {
        patch.plugin = plugin.name;

        if (!Array.isArray(patch.replacement)) patch.replacement = [patch.replacement];

        patches.push(patch);
    }
}

export function startAllPlugins() {
    for (const name in Plugins) if (Settings.plugins[name].enabled) {
        startPlugin(Plugins[name]);
    }
}

export function startPlugin(p: Plugin) {
    if (p.start) {
		logger.info("inicializando plugin", p.name);

		if (p.started) {
			logger.warn(`${p.name} já foi inicializado`);

			return false;
		}

		try {
			p.start();

			p.started = true;
		} catch (err: any) {
			logger.error(`falha ao inicializar ${p.name}\n`, err);

			return false;
		}
	}

	if (p.commands?.length) {
        logger.info("registrando comandos do plugin", p.name);

        for (const cmd of p.commands) {
            try {
                registerCommand(cmd, p.name);
            } catch (e) {
                logger.error(`falha ao registrar o comando ${cmd.name}\n`, e);

                return false;
            }
        }
    }

    return true;
}

export function stopPlugin(p: Plugin) {
    if (p.stop) {
		logger.info("encerrando plugin", p.name);

		if (!p.started) {
			logger.warn(`${p.name} já foi encerrado`);

			return false;
		}

		try {
			p.stop();

			p.started = false;
		} catch (e) {
			logger.error(`falha ao encerrar ${p.name}\n`, e);

			return false;
		}
	}

	if (p.commands?.length) {
        logger.info("desfazendo os registros de comandos do plugin", p.name);

        for (const cmd of p.commands) {
            try {
                unregisterCommand(cmd.name);
            } catch (e) {
                logger.error(`falha ao desfazer o registro do comando ${cmd.name}\n`, e);

                return false;
            }
        }
    }

    return true;
}