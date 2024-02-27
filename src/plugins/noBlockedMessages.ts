import {
	Devs
} from '../utils/constants';

import definePlugin from '../utils/types';

export default definePlugin({
    name: "noblockedmessages",
    description: "esconde completamente todas as mensagens bloqueadas do chat",

    authors: [Devs.Vuw],

    patches: [
        {
            find: 'safety_prompt:"DMSpamExperiment",response:"show_redacted_messages"',

            replacement: [
                {
                    match: /collapsedReason;return (?=\w{1,2}.createElement)/,

                    replace: "collapsedReason; return null;"
                }
            ]
        }
    ]
});