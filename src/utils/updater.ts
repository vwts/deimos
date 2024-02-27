import {
	IpcRes
} from './types';

import IpcEvents from './IpcEvents';
import Logger from './logger';
import gitHash from 'git-hash';

export const UpdateLogger = new Logger("updater", "white");

export let isOutdated = false;
export let isNewer = false;

export let updateError: any;
export let changes: Record<"hash" | "author" | "message", string>[];

async function Unwrap<T>(p: Promise<IpcRes<T>>) {
	const res = await p;

	if (res.ok)
		return res.value;

	throw res.error;
}

export async function checkForUpdates() {
	changes = await Unwrap(DeimosNative.ipc.invoke<IpcRes<typeof changes>> (IpcEvents.GET_UPDATES));

	if (changes.some(c => c.hash === gitHash)) {
		isNewer = true;

		return (isOutdated = false);
	}

	return (isOutdated = changes.length > 0);
}

export async function update() {
	if (!isOutdated)
		return true;

	const res = await Unwrap(DeimosNative.ipc.invoke<IpcRes<boolean>> (IpcEvents.UPDATE));

	if (res)
		isOutdated = false;

	return res;
}

export function getRepo() {
	return Unwrap(DeimosNative.ipc.invoke<IpcRes<string>>(IpcEvents.GET_REPO));
}

type Hashes = Record<"patcher.js" | "preload.js" | "renderer.js", string>;

/**
 * @returns true se a reinicialização for necessária
 */
export async function rebuild() {
	const oldHashes = await Unwrap(DeimosNative.ipc.invoke<IpcRes<Hashes>>(IpcEvents.GET_HASHES));

    if (!await Unwrap(DeimosNative.ipc.invoke<IpcRes<boolean>>(IpcEvents.BUILD)))
        throw new Error("ocorreu um erro na build. por favor tente rodar a build da atualização manualmente.");

    const newHashes = await Unwrap(DeimosNative.ipc.invoke<IpcRes<Hashes>>(IpcEvents.GET_HASHES));

    return oldHashes["patcher.js"] !== newHashes["patcher.js"] || oldHashes["preload.js"] !== newHashes["preload.js"];
}