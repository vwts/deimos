import Plugins from 'plugins';
import Logger from '../utils/logger';

import {
    Patch
} from '../utils/types';

const logger = new Logger("PluginManager", "#a6d189");

export const plugins = Plugins;
export const patches = [] as Patch[];

for (const plugin of Plugins) if (plugin.patches) {
    for (const patch of plugin.patches) {
        patch.plugin = plugin.name;

        if (!Array.isArray(patch.replacement)) patch.replacement = [patch.replacement];

        patches.push(patch);
    }
}

export function startAll() {
    for (const plugin of plugins) if (plugin.start) {
        try {
            logger.info("inicializando plugin", plugin.name);

            plugin.start();
        } catch (err) {
            logger.error("falha ao iniciar plugin", plugin.name, err);
        }
    }
}