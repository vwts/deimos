import type {
    WebpackInstance
} from 'discord-types/other';

export let wreq: WebpackInstance;
export let cache: WebpackInstance["c"];

type FilterFn = (mod: any) => boolean;

export const filters = {
    byProps: (props: string[]): FilterFn => props.length === 1
        ? m => m[props[0]] !== void 0
        : m => props.every(p => m[p] !== void 0),

	byDisplayName: (deezNuts: string): FilterFn => m => m.default?.displayName === deezNuts,

	byCode: (...code: string[]): FilterFn => m => {
		if (typeof m !== 'function')
			return false;

		const s = Function.prototype.toString.call(m);

		for (const c of code) {
			if (!s.includes(c)) return false;
		}

		return true;
	}
};

export const subscriptions = new Map<FilterFn, CallbackFn>();
export const listeners = new Set<CallbackFn>();

export type CallbackFn = (mod: any) => void;

export function _initWebpack(instance: typeof window.webpackChunkdiscord_app) {
    if (cache !== void 0)
        throw "não.";

    wreq = instance.push([[Symbol()], {}, (r) => r]);
    cache = wreq.c;

    instance.pop();
}

export function find(filter: FilterFn, getDefault = true) {
    if (typeof filter !== 'function')
        throw new Error("filtro inválido. função got esperada", filter);

    for (const key in cache) {
        const mod = cache[key];

        if (!mod?.exports)
			continue;

        if (filter(mod.exports))
            return mod.exports;

		if (typeof mod.exports !== 'object')
			continue;

		if (mod.exports.default && filter(mod.exports.default))
			return getDefault ? mod.exports.default : mod.exports;

		for (const nestedMod in mod.exports) if (nestedMod.length < 3) {
            const nested = mod.exports[nestedMod];

            if (nested && filter(nested))
				return nested;
        }
    }

    return null;
}

// todo corrigir
export function findAll(filter: FilterFn, getDefault = true) {
    if (typeof filter !== 'function')
        throw new Error("filtro inválido. função got esperada", filter);

    const ret = [] as any[];

    for (const key in cache) {
        const mod = cache[key];

        if (mod?.exports && filter(mod.exports))
            ret.push(mod.exports);

        if (mod?.exports?.default && filter(mod.exports.default))
            ret.push(getDefault ? mod.exports.default : mod.exports);
    }

    return ret;
}

export function findByProps(...props: string[]) {
    return find(filters.byProps(props));
}

export function findAllByProps(...props: string[]) {
    return findAll(filters.byProps(props));
}

export function findByDisplayName(deezNuts: string) {
    return find(filters.byDisplayName(deezNuts));
}

export function waitFor(filter: string | string[] | FilterFn, callback: CallbackFn) {
    if (typeof filter === 'string')
        filter = filters.byProps([filter]);
    else if (Array.isArray(filter))
        filter = filters.byProps(filter);
    else if (typeof filter !== "function")
        throw new Error("filter deve ser uma string, string[] ou função", filter);

    const existing = find(filter!);

    if (existing)
        return void callback(existing);

    subscriptions.set(filter, callback);
}

export function addListener(callback: CallbackFn) {
    listeners.add(callback);
}

export function removeListener(callback: CallbackFn) {
    listeners.delete(callback);
}

/**
 * pesquisa módulos pela palavra-chave
 *
 * isso busca os métodos factory, significando que você pode pesquisar
 * por todos os tipos de coisas, displayname, methodname, strings, etc
 *
 * @param filters uma ou mais strings ou regexes
 *
 * @returns mapeamento dos módulos encontrados
 */
export function search(...filters: Array<string | RegExp>) {
    const results = {} as Record<number, Function>;
    const factories = wreq.m;

    outer:

    for (const id in factories) {
        const factory = factories[id];
        const str: string = factory.toString();

        for (const filter of filters) {
            if (typeof filter === 'string' && !str.includes(filter))
                continue outer;

            if (filter instanceof RegExp && !filter.test(str))
                continue outer;
        }

        results[id] = factory;
    }

    return results;
}

/**
 * extrai um módulo específico
 */
export function extract(id: number) {
    const mod = wreq.m[id] as Function;

    if (!mod)
        return null;

    const code = `
// [extraído] WebpackModule${id}
// aviso: esse módulo foi extraído para ter uma leitura facilitada.
//        esse módulo não é utilizável!

${mod.toString()}
//# sourceURL=ExtractedWebpackModule${id}
`;

    const extracted = (0, eval)(code);

    return extracted as Function;
}