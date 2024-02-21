import definePlugin from '../utils/types';

import gitHash from 'git-hash';

export default definePlugin({
    name: "Settings",
    description: "adiciona ui de configurações e info de debug",
    author: "vuwints",
    required: true,

    patches: [{
        find: "().versionHash",

        replacement: [
            {
                match: /\w\.createElement\(.{1,2}.Fragment,.{0,30}\{[^}]+\},"Host ".+?\):null/,

                replace: m => {
                    const idx = m.indexOf("Host") - 1;
					const template = m.slice(0, idx);

					return `${m}, ${template}"Deimos ", "${gitHash}"), " "), ` +
						`${template} "Electron ",DeimosNative.getVersions().electron)," "), ` +
						`${template} "Chrome ",DeimosNative.getVersions().chrome)," ")`;
                }
            },
		]
    }, {
        find: "Messages.ACTIVITY_SETTINGS",

        replacement: {
            match: /\{section:(.{1,2})\.ID\.HEADER,\s*label:(.{1,2})\..{1,2}\.Messages\.ACTIVITY_SETTINGS\}/,

            replace: (m, mod) => `{section:${mod}.ID.HEADER,label:"Deimos"},` + `{section:"Deimos",label:"Deimos",element:Deimos.Components.Settings},` + `{section:${mod}.ID.DIVIDER},${m}`
        }
    }]
});