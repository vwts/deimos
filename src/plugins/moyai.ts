import {
	Devs
} from '../utils/constants';

import {
	Message
} from 'discord-types/general';

import {
	FluxDispatcher
} from '../webpack/common';

import definePlugin from '../utils/types';

interface IMessageCreate {
	type: "MESSAGE_CREATE";

	channelId: string;
	isPushNotification: boolean;
    optimistic: boolean;
    message: Message;
}

const MOYAI_URL = "https://github.com/MeguminSama/VencordPlugins/raw/main/plugins/moyai/moyai.mp3";

export default definePlugin({
	name: "moyai",
	description: "🗿🗿🗿🗿🗿",

	authors: [Devs.Vuw],

	execute: async (event: IMessageCreate) => {
		if (event?.type !== "MESSAGE_CREATE")
			return;

        if (!event.message?.content)
			return;

        if (event.message.state === "SENDING")
			return;

        if (event.optimistic)
			return;

		const isInChannel = window.location.pathname.startsWith("/channels/");

		if (!isInChannel)
			return;

		const channelId = window.location.pathname.split("/")[3];

		if (!channelId || channelId !== event.channelId)
			return;

		const moyaiCount = messageContainsMoyai(event.message.content);

		if (!moyaiCount)
			return;

		for (let i = 0; i < moyaiCount; i++) {
			const audioElement = document.createElement("audio");

			audioElement.src = MOYAI_URL;
			audioElement.play();

			await new Promise(resolve => setTimeout(resolve, 300));
		}
	},

	start() {
        FluxDispatcher.subscribe("MESSAGE_CREATE", this.execute);
    },

    stop() {
        FluxDispatcher.unsubscribe("MESSAGE_CREATE", this.execute);
    }
});

const EMOJI_NAME_REGEX = /<a?:(\w+):\d+>/g;

function messageContainsMoyai(message: string): number {
	// captura o número de 🗿 em uma string
	let moyaiCount = (message.match(/🗿/g) || []).length;

	// captura o número de emojis em uma mensagem que se chamam "moyai" ou "moai"
	const emojiNames = message.matchAll(EMOJI_NAME_REGEX);

	if (emojiNames) {
        for (const emojiName of emojiNames) {
            if (!emojiName[1])
				continue;

            let name = emojiName[1];

            // se um emoji inicia ou termina com (moyai|moai)
            if (/^(moyai|moai)/i.test(name) || /(moyai|moai)$/i.test(name)) {
                moyaiCount++;
            }
        }
    }

	// moyai máximo...
	return Math.min(moyaiCount, 10);
}