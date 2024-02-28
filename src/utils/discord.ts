import {
	Guild
} from 'discord-types/general';

import {
	ChannelStore,
	SelectedChennelStore,
	GuildStore
} from '../webpack/common';

export function getCurrentChannel() {
	return ChannelStore.getChannel(SelectedChennelStore.getChannelId());
}

export function getCurrentGuild(): Guild | undefined {
	return GuildStore.getGuild(getCurrentChannel()?.guild_id);
}