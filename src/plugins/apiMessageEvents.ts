import definePlugin from '../utils/types';

export default definePlugin({
    name: "MessageEventAPI",
    description: "api necessária para qualquer coisa que utilize eventos de mensagem.",
    author: "vuwints",

    patches: [
        {
            find: "sendMessage:function",

            replacement: [{
                match: /(?<=sendMessage:function\(.{1,2},.{1,2},.{1,2},.{1,2}\)){/,

                replace: "{Deimos.Api.MessageEvents._handlePreSend(...arguments);"
            }, {
                match: /(?<=editMessage:function\(.{1,2},.{1,2},.{1,2}\)){/,

                replace: "{Deimos.Api.MessageEvents._handlePreEdit(...arguments);"
            }]
        },

        {
            find: "if(e.altKey){",

            replacement: {
                match: /\.useClickMessage=function\((.{1,2}),(.{1,2})\).+?function\((.{1,2})\){/,

                replace: (m, message, channel, event) =>
                    `${m.replace("{", `{var _msg=${message};var _chan=${channel};`)}Deimos.Api.MessageEvents._handleClick(_msg, _chan, ${event});`
            }
        }
    ]
});