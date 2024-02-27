import {
	Channel,
	Guild
} from 'discord-types/general';

import {
	waitFor
} from '../webpack';

export function _init(cmds: Command[]) {
	try {
		BUILT_IN = cmds;

		OptionalMessageOption = cmds.find(c => c.name === "shrug")!.options![0];
        RequiredMessageOption = cmds.find(c => c.name === "me")!.options![0];
	} catch (e) {
		console.error("falha ao carregar a api de comandos");
	}

	return cmds;
}

export let BUILT_IN: Command[];
export const commands = {} as Record<string, Command>;

// hack para plugins que evaluem antes de serem capturados pelo webpack
const OptPlaceholder = Symbol("OptionalMessageOption") as any as Option;
const ReqPlaceholder = Symbol("RequiredMessageOption") as any as Option;

/**
 * opção de mensagem chamada "message" (pode ser utilizada nos comandos)
 *
 * utilizada em "tableflip" ou "shrug"
 *
 * @see {@link RequiredMessageOption}
 */
export let OptionalMessageOption: Option = OptPlaceholder;

/**
 * opção de mensagem necessária chamada "message" (pode ser utilizada nos comandos)
 *
 * utilizada em "me"
 *
 * @see {@link Option}
 */
export let RequiredMessageOption: Option = ReqPlaceholder;

let SnowflakeUtils: any;

waitFor("fromTimestamp", m => SnowflakeUtils = m);

export function generateId() {
    return `-${SnowflakeUtils.fromTimestamp(Date.now())}`;
}

/**
 * obtém o valor de uma opção pelo nome
 *
 * @param args array de argumentos (primeiro argumento é passado para ser executado)
 * @param name nome de cada argumento
 * @param fallbackValue valor callback em caso dessa opção não for passada adiante
 *
 * @returns valor
 */
export function findOption<T extends string | undefined>(args: Argument[], name: string, fallbackValue?: T): T extends undefined ? T : string {
    return (args.find(a => a.name === name)?.value || fallbackValue) as any;
}

function modifyOpt(opt: Option | Command) {
    opt.displayName ||= opt.name;
    opt.displayDescription ||= opt.description;

    opt.options?.forEach((opt, i, opts) => {
        // ver comentário acima de placeholders

        if (opt === OptPlaceholder)
			opts[i] = OptionalMessageOption
        else if (opt === ReqPlaceholder)
			opts[i] = RequiredMessageOption;

		modifyOpt(opts[i]);
    });
}

export function registerCommand(command: Command, plugin: string) {
    if (BUILT_IN.some(c => c.name === command.name))
        throw new Error(`o comando '${command.name}' já existe.`);

    command.id ||= generateId();
    command.applicationId ||= "-1"; // built_in;
    command.type ||= ApplicationCommandType.CHAT_INPUT;
    command.inputType ||= ApplicationCommandInputType.BUILT_IN_TEXT;
    command.plugin ||= plugin;

    modifyOpt(command);
    commands[command.name] = command;

    BUILT_IN.push(command);
}

export function unregisterCommand(name: string) {
    const idx = BUILT_IN.findIndex(c => c.name === name);

    if (idx === -1)
        return false;

    BUILT_IN.splice(idx, 1);

    delete commands[name];
}

export interface CommandContext {
    channel: Channel;

    guild?: Guild;
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11
}

export enum ApplicationCommandInputType {
    BUILT_IN = 0,
    BUILT_IN_TEXT = 1,
    BUILT_IN_INTEGRATION = 2,
    BOT = 3,
    PLACEHOLDER = 4
}

export interface Option {
    name: string;
    displayName?: string;
    type: ApplicationCommandOptionType;
    description: string;
    displayDescription?: string;
    required?: boolean;
    options?: Option[];
}

export enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}

export interface CommandReturnValue {
    content: string;
}

export interface Argument {
    type: ApplicationCommandOptionType;
    name: string;
    value: string;
    focused: undefined;
}

export interface Command {
    id?: string;
    applicationId?: string;
    type?: ApplicationCommandType;
    inputType?: ApplicationCommandInputType;
    plugin?: string;

    name: string;
    displayName?: string;
    description: string;
    displayDescription?: string;

    options?: Option[];
	
    predicate?(ctx: CommandContext): boolean;

    execute(args: Argument[], ctx: CommandContext): CommandReturnValue | void;
}