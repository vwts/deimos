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

set -e

patcher="$PWD/patcher.js"

dicksword="$(dirname "$(readlink "$(which discord)")")"
resources="$dicksword/resources"

if [ ! -f "$resources/app.asar" ]; then
    echo "não foi possível encontrar a pasta discord"

    exit
fi

app="$resources/app"

if [ -e "$app" ]; then
    echo "pasta app existe. parece que seu discord já foi modificado"

    exit
fi

mkdir "$app"
tee > "$app/index.js" << EOF
require("$patcher");
require("../app.asar");
EOF

tee > "$app/package.json" << EOF
{
    "main": "index.js",
    "name": "discord"
}
EOF