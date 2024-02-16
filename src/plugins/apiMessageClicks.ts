import definePlugin from '../utils/types';

export default definePlugin({
    name: "MessageClicksApi",
    description: "api necessária para qualquer ação que envolva cliques",
    author: "vuwints",

    patches: [{
        find: "if(e.altKey){",

        replacement: {
            match: /\.useClickMessage=function\((.{1,2}),(.{1,2})\).+?function\((.{1,2})\){/,
            
            replace: (m, message, channel, event) =>
                // o parâmetro message é escondido pelo parâmetro event

                `${m.replace("{", `{var _msg=${message};var _chan=${channel};`)}Deimos.Api.MessageClicks._handleClick(_msg, _chan, ${event});`
        }
    }]
});