import {
    Message,
    Channel
} from 'discord-types/general';

import Logger from '../utils/logger';

const MessageEventsLogger = new Logger("MessageEvents", "#e5c890");

export interface Emoji {
    require_colons: boolean,
    originalName: string,
    animated: boolean;

    guildId: string,
    name: string,
    url: string,
    id: string
}

export interface MessageObject {
    content: string,

    validNonShortcutEmojis: Emoji[];
}

export type SendListener = (channelId: string, messageObj: MessageObject, extra: any) => void;
export type EditListener = (channelId: string, messageId: string, messageObj: MessageObject) => void;

const sendListeners = new Set<SendListener>();
const editListeners = new Set<EditListener>();

export function _handlePreSend(channelId: string, messageObj: MessageObject, extra: any) {
    for (const listener of sendListeners) {
        try {
            listener(channelId, messageObj, extra);
        } catch (e) {
            MessageEventsLogger.error(`MessageSendHandler: listener encontrou um erro desconhecido. (${e})`)
        }
    }
}

export function _handlePreEdit(channelId: string, messageId: string, messageObj: MessageObject) {
    for (const listener of editListeners) {
        try {
            listener(channelId, messageId, messageObj);
        } catch (e) {
            MessageEventsLogger.error(`MessageEditHandler: listener encontrou um erro desconhecido. (${e})`);
        }
    }
}

export function addPreSendListener(listener: SendListener) {
    sendListeners.add(listener);

    return listener;
}

export function addPreEditListener(listener: EditListener) {
    editListeners.add(listener);

    return listener;
}

export function removePreSendListener(listener: SendListener) {
    return sendListeners.delete(listener);
}

export function removePreEditListener(listener: EditListener) {
    return editListeners.delete(listener);
}

// cliques de mensagem
type ClickListener = (message: Message, channel: Channel, event: MouseEvent) => void;

const listeners = new Set<ClickListener>();

export function _handleClick(message, channel, event) {
    for (const listener of listeners) {
        try {
            listener(message, channel, event);
        } catch (e) {
            MessageEventsLogger.error(`MessageClickHandler: listener encontrou um erro desconhecido. (${e})`);
        }
    }
}

export function addClickListener(listener: ClickListener) {
    listeners.add(listener);

    return listener;
}

export function removeClickListener(listener: ClickListener) {
    return listeners.delete(listener);
}