type Enum<T extends Record<string, string>> = {
    [k in keyof T]: T[k];
} & { [v in keyof T as T[v]]: v; };

function strEnum<T extends Record<string, string>>(obj: T): T {
    const o = {} as T;

    for (const key in obj) {
        o[key] = obj[key] as any;
        o[obj[key]] = key as any;
    };

    return o;
}

export default strEnum({
    QUICK_CSS_UPDATE: "DeimosQuickCssUpdate",
    GET_QUICK_CSS: "DeimosGetQuickCss",
    GET_SETTINGS_DIR: "DeimosGetSettingsDir",
    GET_SETTINGS: "DeimosGetSettings",
    SET_SETTINGS: "DeimosSetSettings",
    OPEN_EXTERNAL: "DeimosOpenExternal",
    OPEN_PATH: "DeimosOpenPath"
} as const);