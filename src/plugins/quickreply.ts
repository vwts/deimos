import {
	Devs
} from '../utils/constants';

import {
	FluxDispatcher as Dispatcher
} from '../webpack/common';

import {
	filters
} from '../webpack';

import {
	lazyWebpack
} from '../utils/misc';

import definePlugin from '../utils/types';

const channelIdModule = lazyWebpack(filters.byProps(["getChannelId"]));
const channelModule = lazyWebpack(filters.byProps(["getChannel"]));
const messagesModule = lazyWebpack(filters.byProps(["getRawMessages"]));

export default definePlugin({
	name: "quickreply",
	description: "responde as mensagens mais rapidamente (ctrl + direção)",

	authors: [Devs.Vuw],

	start() {
		Dispatcher.subscribe("DELETE_PENDING_REPLY", onDeletePendingReply);

		document.addEventListener("keydown", onKeydown);
	},

	stop() {
		Dispatcher.unsubscribe("DELETE_PENDING_REPLY", onDeletePendingReply);

		document.removeEventListener("keydown", onKeydown);
	}
});

let idx = -1;

function onDeletePendingReply() {
	idx = -1;
}

function onKeydown(e: KeyboardEvent) {
	if (
		(!e.ctrlKey && !e.metaKey) || (e.key !== "ArrowUp" && e.key !== "ArrowDown")
	) {
		return;
	}

	const channelId = channelIdModule.getChannelId();
    const channel = channelModule.getChannel(channelId);
    const messages = messagesModule.getMessages(channelId).toArray().reverse();

	if (e.key === "ArrowUp")
		idx += 1;
	else if (e.key === "ArrowDown")
		idx = Math.max(-1, idx - 1);

	if (idx > messages.length)
		idx = messages.length;

	if (idx < 0) {
		return void Dispatcher.dispatch({
			type: "DELETE_PENDING_REPLY", channelId
		});
	}

	Dispatcher.dispatch({
		type: "CREATE_PENDING_REPLY",
		channel: channel,
		message: messages[idx],
		showMentionToggle: channel.guild_id !== null
	});
}