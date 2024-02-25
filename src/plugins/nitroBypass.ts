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

import {
	UserStore
} from '../webpack/common';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "nitrobypass",
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
        },

		{
			find: "STREAM_FPS_OPTION.format",

			replacement: {
				match: /(userPremiumType|guildPremiumTier):.{0,10}TIER_\d,?/g,

				replace: ""
			}
		}
    ],

	get guildId() {
        return window.location.href.split("channels/")[1].split("/")[0];
    },

    get canUseEmotes() {
        return Boolean(UserStore.getCurrentUser().premiumType);
    },

    start() {
        if (this.canUseEmotes) {
			console.info("[nitrobypass] pulando o início porque você tem nitro");

			return;
		}

        const {
			getCustomEmojiById
		} = findByProps("getCustomEmojiById");

		function getWordBoundary(origStr, offset) {
			return (!origStr[offset] || /\s/.test(origStr[offset])) ? "" : " ";
		}

        this.preSend = addPreSendListener((_, messageObj) => {
            const guildId = this.guildId;

            for (const emoji of messageObj.validNonShortcutEmojis) {
                if (!emoji.require_colons)
                    continue;

                if (emoji.guildId === guildId && !emoji.animated)
                    continue;

                const emojiString = `<${emoji.animated ? 'a' : ''}:${emoji.originalName || emoji.name}:${emoji.id}>`;
                const url = emoji.url.replace(/\?size=[0-9]+/, `?size=48`);

                messageObj.content = messageObj.content.replace(emojiString, (match, offset, origStr) => {
                    return `${getWordBoundary(origStr, offset-1)}${url}${getWordBoundary(origStr, offset+match.length)}`;
                });
            }
        });

        this.preEdit = addPreEditListener((_, __, messageObj) => {
            const guildId = this.guildId;

            for (const [emojiStr, _, emojiId] of messageObj.content.matchAll(/(?<!\\)<a?:(\w+):(\d+)>/ig)) {
                const emoji = getCustomEmojiById(emojiId);

                if (emoji == null || (emoji.guildId === guildId && !emoji.animated))
                    continue;

				if (!emoji.require_colons)
					continue;

                const url = emoji.url.replace(/\?size=[0-9]+/, `?size=48`);

                messageObj.content = messageObj.content.replace(emojiStr, (match, offset, origStr) => {
                    return `${getWordBoundary(origStr, offset-1)}${url}${getWordBoundary(origStr, offset+match.length)}`;
                });
            }
        });
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    }
});