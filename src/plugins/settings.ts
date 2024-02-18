import definePlugin from '../utils/types';

import gitHash from 'git-hash';

export default definePlugin({
    name: "Settings",
    description: "adiciona ui de configurações e info de debug",
    author: "vuwints",
    required: true,

    patches: [{
        find: "default.versionHash",

        replacement: [
            {
                match: /return .{1,2}\("div"/,
                
                replace: (m) => {
                    return `var versions=DeimosNative.getVersions();${m}`;
                }
            },

            {
                match: /\w\.createElement.+?["']Host ["'].+?\):null/s,

                replace: m => {
                    const idx = m.indexOf("Host") - 1;
                    const template = m.slice(0, idx);

                    return `${m}, ${template}"Deimos ", "${gitHash}"), " "), ` +
                        `${template} "Electron ", versions.electron), " "), ` +
                        `${template} "Chrome ", versions.chrome), " ")`;
                }
            }
        ]
    }, {
        find: "Messages.ACTIVITY_SETTINGS",

        replacement: {
            match: /\{section:(.{1,2})\.SectionTypes\.HEADER,\s*label:(.{1,2})\.default\.Messages\.ACTIVITY_SETTINGS\}/,

            replace: (m, mod) => `{section:${mod}.SectionTypes.HEADER,label:"Deimos"},` + `{section:"Deimos",label:"Deimos",element:Deimos.Components.Settings},` + `{section:${mod}.SectionTypes.DIVIDER},${m}`
        }
    }]
});