declare global {
    export var DeimosNative: typeof import('./DeimosNative').default;

    export var appSettings: {
        set(setting: string, v: any): void;
    }

    interface Window {
        webpackChunkdiscord_app: {
            push(chunk: any): any;
        };
    }
}

export { };