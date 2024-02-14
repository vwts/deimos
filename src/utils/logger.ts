export default class Logger {
    constructor(public name: string, public color: string) { }

    private _log(level: "log" | "erro" | "aviso" | "info" | "debug", args: any[]) {
        console[level](`%c ${this.name} `, `background: ${this.color}; color: black; font-weight: bold`, ...args);
    }

    public log(...args: any[]) {
        this._log("log", args);
    }

    public info(...args: any[]) {
        this._log("info", args);
    }

    public error(...args: any[]) {
        this._log("erro", args);
    }

    public warn(...args: any[]) {
        this._log("aviso", args);
    }

    public debug(...args: any[]) {
        this._log("debug", args);
    }
}