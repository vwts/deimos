import TDeimosNative from './DeimosNative';

declare global {
    export var DeimosNative: typeof TDeimosNative;

    export var appSettings: {
        set(setting: string, v: any): void;
    }

    interface Window {
        webpackChunkdiscord_app: {
            push(chunk: any): any;
        };
    }
}