import {
    MessageClicks
} from '../api';

import {
    find,
    findByProps
} from '../webpack';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "MessageQuickActions",
    description: "exclusão e edição rápidas",
    author: "vuwints",

    dependencies: ["MessageClicksApi"],

    start() {
        const { deleteMessage, startEditMessage } = findByProps("deleteMessage");
        const { can } = findByProps("can", "initialize");

        const { Permissions: { MANAGE_MESSAGES } } = find(m => m.Permissions?.MANAGE_MESSAGES);
        const { getCurrentUser } = findByProps("getCurrentUser");

        let isDeletePressed = false;

        document.addEventListener("keydown", e => {
            if (e.key === "Backspace") isDeletePressed = true;
        });

        document.addEventListener("keyup", e => {
            if (e.key === "Backspace") isDeletePressed = false;
        });

        MessageClicks.addListener((msg, chan, event) => {
            const isMe = msg.author.id === getCurrentUser().id;

            if (!isDeletePressed) {
                if (isMe && event.detail >= 2) {
                    startEditMessage(chan.id, msg.id, msg.content);

                    event.preventDefault();
                }
            } else if (isMe || can(MANAGE_MESSAGES, chan)) {
                deleteMessage(chan.id, msg.id);

                event.preventDefault();
            }
        });
    }
});