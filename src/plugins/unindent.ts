import {
    addPreSendListener,
    addPreEditListener,
    MessageObject,
    removePreSendListener,
    removePreEditListener
} from '../api/MessageEvents';

import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "unindent",
    description: "melhora a indentação para blocos de código",

    authors: [Devs.Vuw],

	dependencies: ["MessageEventsAPI"],

    patches: [
        {
            find: "inQuote:",

            replacement: {
                match: /,content:([^,]+),inQuote/,

                replace: (_, content) => `,content:Deimos.Plugins.plugins.Unindent.unindent(${content}),inQuote`
            }
        }
    ],

    unindent(str: string) {
        // usuários não podem mandar tabs
        str = str.replace(/\t/g, "    ");

        const minIndent = str.match(/^ *(?=\S)/gm)
            ?.reduce((prev, curr) => Math.min(prev, curr.length), Infinity) ?? 0;

        if (!minIndent)
            return str;

        return str.replace(new RegExp(`^ {${minIndent}}`, "gm"), "");
    },

    unindentMsg(msg: MessageObject) {
        msg.content = msg.content.replace(/```(.|\n)*?```/g, m => {
            const lines = m.split("\n");

            if (lines.length < 2)
                return m; // não afeta os codeblocks inline

            let suffix = "";

            if (lines[lines.length - 1] === "```")
                suffix = lines.pop()!;

            return `${lines[0]}\n${this.unindent(lines.slice(1).join("\n"))}\n${suffix}`;
        });
    },

    start() {
        this.preSend = addPreSendListener((_, msg) => this.unindentMsg(msg));
        this.preEdit = addPreEditListener((_cid, _mid, msg) => this.unindentMsg(msg));
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    }
});