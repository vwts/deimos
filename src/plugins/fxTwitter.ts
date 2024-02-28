import {
	addPreSendListener,
	MessageObject,
	removePreSendListener
} from '../api/MessageEvents';

import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
	name: "fxtwitter",
	description: "melhora as embeds do twitter ao mandar",

	authors: [Devs.Vuw],

	dependencies: ["MessageEventsAPI"],

	addPrefix(msg: MessageObject) {
		msg.content = msg.content.replace(/https?:\/\/twitter\.com(?=\/.*?\/)/g, "https://fxtwitter.com");
	},

	start() {
		this.preSend = addPreSendListener((_, msg) => this.addPrefix(msg));
	},

	stop() {
		removePreSendListener(this.preSend);
	}
});