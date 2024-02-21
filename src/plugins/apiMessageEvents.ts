import definePlugin from '../utils/types';

export default definePlugin({
    name: "MessageEventAPI",
    description: "api necessária para qualquer coisa que utilize eventos de mensagem.",
    author: "vuwints",

    patches: [
        {
            find: "sendMessage:function",

            replacement: [{
                match: /(?<=_sendMessage:function\([^)]+\)){/,

                replace: "{Deimos.Api.MessageEvents._handlePreSend(...arguments);"
            }, {
                match: /(?<=\beditMessage:function\([^)]+\)){/,

                replace: "{Deimos.Api.MessageEvents._handlePreEdit(...arguments);"
            }]
        },

        {
            find: "if(e.altKey){",

            replacement: {
                match: /var \w=(\w)\.id,\w=(\w)\.id;return .{1,2}\.useCallback\(\(?function\((.{1,2})\){/,

                replace: (m, message, channel, event) =>
				`var _msg=${message},_chan=${channel};${m}Deimos.Api.MessageEvents._handleClick(_msg, _chan, ${event});`
            }
        }
    ]
});