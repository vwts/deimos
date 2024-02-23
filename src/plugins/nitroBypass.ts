import {
    addPreSendListener,
    addPreEditListener,
    SendListener,
    removePreSendListener,
    removePreEditListener
} from '../api/MessageEvents';

import {
    findByProps
} from '../webpack';

import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "nitro bypass",
    description: "permite compartilhamento de tela com qualidade nitro e fake emojis animados",

	authors: [Devs.Vuw],

    dependencies: ["MessageEventsAPI"],

    patches: [
        {
            find: `canUseAnimatedEmojis:function`,

            replacement: [
                "canUseAnimatedEmojis",
                "canUseEmojisEverywhere",
                "canUseHigherFramerate"
            ].map(func => {
                return {
                    match: new RegExp(`${func}:function\\(.+?}`),

                    replace: `${func}:function (e) { return true; }`
                };
            })
        }
    ],

    start() {
        const {
            getCustomEmojiById
        } = findByProps("getCustomEmojiById");

        // remover qualquer necessidade nitro para qualquer uma das configurações de streaming
        findByProps("ApplicationStreamPresets")
            .ApplicationStreamSettingRequirements

            .forEach(x => {
                delete x.userPremiumType;
                delete x.guildPremiumTier
            });

        this.preSend = addPreSendListener((_, messageObj) => {
            const guildId = window.location.href.split("channels/")[1].split("/")[0];

            for (const emoji of messageObj.validNonShortcutEmojis) {
                if (!emoji.require_colons)
                    continue;

                if (emoji.guildId === guildId && !emoji.animated)
                    continue;

                const emojiString = `<${emoji.animated ? 'a' : ''}:${emoji.originalName || emoji.name}:${emoji.id}>`;
                const url = emoji.url.replace(/\?size=[0-9]+/, `?size=48`);

                messageObj.content = messageObj.content.replace(emojiString, ` ${url} `);
            }
        });

        this.preEdit = addPreEditListener((_, __, messageObj) => {
            const guildId = window.location.href.split("channels/")[1].split("/")[0];

            for (const [emojiStr, _, emojiId] of messageObj.content.matchAll(/(?<!\\)<a?:(\w+):(\d+)>/ig)) {
                const emoji = getCustomEmojiById(emojiId);

                if (emoji == null || (emoji.guildId === guildId && !emoji.animated))
                    continue;

                const url = emoji.url.replace(/\?size=[0-9]+/, `?size=48`);

                messageObj.content = messageObj.content.replace(emojiStr, ` ${url} `);
            }
        });
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    }
});