import Plugins from 'plugins';
import Logger from '../utils/logger';

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
    for (const plugin in Plugins) if (Settings.plugins[plugin].enabled) {
        startPlugin(Plugins[plugin]);
    }
}

export function startPlugin(p: Plugin) {
    if (!p.start)
		return true;

	logger.info("inicializando plugin", p.name);

	if (p.started) {
		logger.warn(`${p.name} já foi inicializado`);

		return false;
	}

	try {
		p.start();
		p.started = true;

		return true;
	} catch (err: any) {
		logger.error(`falha ao inicializar ${p.name}\n`, err);

		return false;
	}
}

export function stopPlugin(p: Plugin) {
    if (!p.stop)
		return true;

	logger.info("encerrando plugin", p.name);

	if (!p.started) {
		logger.warn(`${p.name} já foi encerrado / nunca inicializou`);

		return false;
	}

	try {
		p.stop();
		p.started = false;

		return true;
	} catch (err: any) {
		logger.error(`falha ao encerrar ${p.name}\n`, err);

		return false;
	}
}