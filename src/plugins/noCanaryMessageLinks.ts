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
	name: "nocanarymessagelinks",
	description: "remove os prefixos canary e ptb dos links de mensagem",

	authors: [Devs.Vuw],

	dependencies: ["MessageEventsAPI"],

	removeBetas(msg: MessageObject) {
		msg.content = msg.content.replace(/(?<=https:\/\/)(canary.|ptb.)(?=discord(?:app)?.com\/channels\/(?:\d{17,20}|@me)\/\d{17,20}\/\d{17,20})/g, ""); // dei w
	},

	start() {
		this.preSend = addPreSendListener((_, msg) => this.removeBetas(msg));
	},

	stop() {
		removePreSendListener(this.preSend);
	}
});