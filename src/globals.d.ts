declare global {
	export var IS_WEB: boolean;

    export var DeimosNative: typeof import('./DeimosNative').default;
    export var Deimos: typeof import('./Deimos');

    export var appSettings: {
        set(setting: string, v: any): void;
    };

    interface Window {
        webpackChunkdiscord_app: {
            push(chunk: any): any;

            pop(): any;
        };

        [k: PropertyKey]: any;
    }
}

export { };