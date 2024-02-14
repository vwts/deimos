import {
    startAll
} from '../plugins';

import Logger from './logger';

let webpackCache: typeof window.webpackChunkdiscord_app;

export const subscriptions = new Map<FilterFn, CallbackFn>();
export const listeners = new Set<CallbackFn>();

type FilterFn = (mod: any) => boolean;
type CallbackFn = (mod: any) => void;

export let Common: {
    React: typeof import('react'),

    FluxDispatcher: any;
    UserStore: any;
} = {} as any;

export function _initWebpack(instance: typeof window.webpackChunkdiscord_app) {
    if (webpackCache !== void 0) throw "não.";

    webpackCache = instance.push([[Symbol()], {}, (r) => r.c]);

    instance.pop();

    let started = false;

    waitFor("getCurrentUser", x => Common.UserStore = x);

    waitFor(["dispatch", "subscribe"], x => {
        Common.FluxDispatcher = x;

        const cb = () => {
            console.info("conexão aberta");

            x.unsubscribe("CONNECTION_OPEN", cb);

            startAll();
        };

        x.subscribe("CONNECTION_OPEN", cb);
    });

    waitFor("useState", x => Common.React = x);
}

export function find(filter: FilterFn, getDefault = true) {
    if (typeof filter !== 'function')
        throw new Error("filtro inválido. uma função era esperada", filter);

    for (const key in webpackCache) {
        const mod = webpackCache[key];

        if (mod?.exports && filter(mod.exports))
            return mod.exports;

        if (mod?.exports?.default && filter(mod.exports.default))
            return getDefault ? mod.exports.default : mod.exports;
    }

    return null;
}

export function findAll(filter: FilterFn, getDefault = true) {
    if (typeof filter !== 'function') throw new Error("filtro inválido. uma função era esperada", filter);

    const ret = [] as any[];

    for (const key in webpackCache) {
        const mod = webpackCache[key];

        if (mod?.exports && filter(mod.exports)) ret.push(mod.exports);
        if (mod?.exports?.default && filter(mod.exports.default)) ret.push(getDefault ? mod.exports.default : mod.exports);
    }

    return ret;
}

export const filters = {
    byProps: (props: string[]): FilterFn => props.length === 1
        ? m => m[props[0]] !== void 0
        : m => props.every(p => m[p] !== void 0),

    byDisplayName: (deezNuts: string): FilterFn => m => m.default?.displayName === deezNuts
};

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
    if (typeof filter === "string") filter = filters.byProps([filter]);
    else if (Array.isArray(filter)) filter = filters.byProps(filter);
    else if (typeof filter !== "function") throw new Error("filtro deve ser uma string, string[] ou função", filter);

    const existing = find(filter!);
    
    if (existing) return void callback(existing);

    subscriptions.set(filter, callback);
}

export function addListener(callback: CallbackFn) {
    listeners.add(callback);
}

export function removeListener(callback: CallbackFn) {
    listeners.delete(callback);
}