import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';
import gitHash from 'git-hash';

export default definePlugin({
    name: "Settings",
    description: "adiciona ui de configurações e info de debug",

    authors: [Devs.Vuw],

    required: true,

    patches: [{
        find: "().versionHash",

        replacement: [
            {
                match: /\w\.createElement\(.{1,2}.Fragment,.{0,30}\{[^}]+\},"Host ".+?\):null/,

                replace: m => {
                    const idx = m.indexOf("Host") - 1;
					const template = m.slice(0, idx);

					let r = `${m}, ${template}"Deimos ", "${gitHash}${IS_WEB ? " (Web)" : ""}"), " ")`;

					if (!IS_WEB) {
						r += `,${template} "Electron ",DeimosNative.getVersions().electron)," "),`;
                        r += `${template} "Chrome ",DeimosNative.getVersions().chrome)," ")`;
					}

					return r;
                }
            }
		]
    }, {
        find: "Messages.ACTIVITY_SETTINGS",

        replacement: {
            match: /\{section:(.{1,2})\.ID\.HEADER,\s*label:(.{1,2})\..{1,2}\.Messages\.ACTIVITY_SETTINGS\}/,

            replace: (m, mod) => '{section:${mod}.ID.HEADER,label:"deimos"},` + `{section:"DeimosSetting",label:"deimos",element:Deimos.Components.Settings},' + '{section:"DeimosUpdater",label:"updater",element:Deimos.Components.Updater,predicate:()=>!IS_WEB},' + '{section:${mod}.ID.DIVIDER},${m}'
        }
    }]
});