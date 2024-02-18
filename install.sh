#!/bin/sh
#
# instalador super simples. provavelmente deverá rodar como root.
# caso esteja dando problemas de permissão, provavelmente é isso.
#
# caso mesmo assim não funcione, ou não esteja no linux, apenas
# - localize sua pasta do discord
# - dentro da pasta resources, crie uma nova pasta chamada "app"
# - dentro de app, crie os arquivos index.js e package.json
# - veja os dois comandos tee no final do arquivo para seus conteúdos

patcher="$PWD/dist/patcher.js"

discord_bin="$(which discord)"
discord_actual="$(readlink "$discord_bin")"

if [ -z "$discord_actual" ]; then
    case "$(head -n1 "$discord_bin")" in
        \#!/*)
            # script wrapper, assumir que a segunda linha tenha a call do executável do electron e tentar fazer coincidir com o path do asar
            path="$(tail -1 "$discord_bin" | grep -Eo "\S+/app.asar" | sed 's/${name}/discord/')"

            if [ -z "$path" ]; then
                echo "instalação não-suportada. $discord_bin é um script wrapper mas a útlima linha não executa call?"

                exit
            elif [ -e "$path" ]; then
                discord="$(dirname "$path")"
            else
                echo "instalação não-suportada. $path não encontrado"

                exit 1
            fi
            ;;
        
        *)
            echo "instalação não-suportada. $discord_bin não é nem um symlink e nem um script wrapper."

            exit 1
            ;;
    esac
else
    discord="$(dirname "$discord_actual")"
fi

resources="$discord/resources"
app="$resources/app"
app_asar="app.asar"

if [ ! -e "$resources" ]; then
    if [ -e "$discord/app.asar.unpacked" ]; then
        # instalação de electron sistema
        mv "$discord/app.asar" "$discord/_app.asar"
        mv "$discord/app.asar.unpacked" "$discord/_app.asar.unpacked"

        app="$discord/app.asar"
        app_asar="_app.asar"
    else
        echo "instalação não-suportada. $discord não possui a pasta resources e também não possui o electron de sistema instalado"

        exit
    fi
fi

if [ -e "$app" ]; then
    echo "pasta app existe. parece que seu discord já foi modificado."

    exit
fi

mkdir "$app"
tee > "$app/index.js" << EOF
require("$patcher");
require("../$app_asar");
EOF

tee > "$app/package.json" << EOF
{
    "main": "index.js",
    "name": "discord"
}
EOF