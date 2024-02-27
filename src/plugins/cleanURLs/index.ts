import {
	defaultRules
} from './defaultRules';

import {
	addPreSendListener,
	addPreEditListener,
    MessageObject,
    removePreSendListener,
    removePreEditListener
} from '../../api/MessageEvents';

import definePlugin from '../../utils/types';

// do lodash
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export default definePlugin({
	name: "clearurls",
	description: "remove os trackings dos urls",

	authors: [
		{
			name: "vuwints",
			id: 0n
		}
	],

	dependencies: ["MessageEventsAPI"],

	escapeRegExp(str: string) {
		return (str && reHasRegExpChar.test(str))
			? str.replace(reRegExpChar, "\\$&")
			: (str || "");
	},

	createRules() {
		// pode ser estendido
		const rules = defaultRules;

		this.universalRules = new Set();
        this.rulesByHost = new Map();
        this.hostRules = new Map();

		for (const rule of rules) {
			const splitRule = rule.split("@");

			const paramRule = new RegExp(
				"^" + this.escapeRegExp(splitRule[0]).replace(/\\\*/, ".+?") + "$"
			);

			if (!splitRule[1]) {
				this.universalRules.add(paramRule);

				continue;
			}

			const hostRule = new RegExp(
				"^(www\\.)?" + this.escapeRegExp(splitRule[1])
					.replace(/\\\./, "\\.")
					.replace(/^\\\*\\\./, "(.+?\\.)?")
					.replace(/\\\*/, ".+?") + "$"
			);

			const hostRuleIndex = hostRule.toString();

			this.hostRules.set(hostRuleIndex, hostRule);

            if (this.rulesByHost.get(hostRuleIndex) == null) {
                this.rulesByHost.set(hostRuleIndex, new Set());
            }

            this.rulesByHost.get(hostRuleIndex).add(paramRule);
		}
	},

	removeParam(rule: string | RegExp, param: string, parent: URLSearchParams) {
		if (param === rule || rule instanceof RegExp && rule.test(param)) {
			parent.delete(param);
		}
	},

	replacer(match: string) {
		// analisa a url sem mostrar erros
		try {
			var url = new URL(match);
		} catch (error) {
			// não modifica nada se não puder analisar a url

			return match;
		}

		// método robusta de checar se existe-se qualquer parâmetro de busca
		if (url.searchParams.entries().next().done) {
			// se não houver nenhum, não será preciso modificar nada
			return match;
		}

		// checa todas as regras universais
		this.universalRules.forEach((rule) => {
			url.searchParams.forEach((_value, param, parent) => {
				this.removeParam(rule, param, parent);
			});
		});

		// checa as regras para cada hosts que coincidem
		this.hostRules.forEach((regex, hostRuleName) => {
			if (!regex.test(url.hostname))
				return;

			this.rulesByHost.get(hostRuleName).forEach((rule) => {
				url.searchParams.forEach((_value, param, parent) => {
					this.removeParam(rule, param, parent);
				});
			});
		});

		return url.toString();
	},

	onSend(msg: MessageObject) {
		// apenar roda em mensagens que contém urls
		if (msg.content.match(/http(s)?:\/\//)) {
			msg.content = msg.content.replace(
				/(https?:\/\/[^\s<]+[^<.,:;"'>)|\]\s])/g, (match) => this.replacer(match)
			);
		}
	},

	start() {
		this.createRules();

        this.preSend = addPreSendListener((_, msg) => this.onSend(msg));
        this.preEdit = addPreEditListener((_cid, _mid, msg) => this.onSend(msg));
	},

	stop() {
		removePreEditListener(this.preSend);
		removePreEditListener(this.preEdit);
	}
});