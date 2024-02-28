# deimos

cliente discord desktop modificado

## recursos

- funciona na última atualização swc do discord que quebrava todos os outros mods
- suporte para navegadores (experimental): rode o deimos no seu navegador em vez de rodá-lo no app desktop
- css customizado e temas: manualmente edite `%appdata%/Deimos/settings/quickCss.css` / `~/.config/Deimos/settings/quickCss.css` com o seu editor favorito e o client irá automaticamente aplicar suas mudanças. para importar os temas do betterdiscord, apenas adicione `@import url(theUrl)` no topo desse arquivo. (certifique-se de que o url seja um url cru do github ou similar e contenha apenas texto plano)
- diversos plugins úteis - [lista](https://github.com/vwts/Deimos/tree/main/src/plugins)
- experiments
- isolação de contexto -> funciona nas versões mais novas do electron (funcionamento confirmado nas versões 13 ~ 21)

## instalação

se você não consegue seguir as instruções, utilize algum outro client de discord alternativo, como o betterdiscord.

instale [node.js](https://nodejs.org/en/download) e o [git](https://git-scm.com/download)

abra um terminal e rode os seguintes comandos. (se algum deles derem erro, você não instalou o node.js e o git apropriadamente.)

> aviso: no windows, NÃO rode o terminal como administrador. se você executá-lo e no path diz: system32, você iniciou como administrador.

```sh
npm i -g pnpm
git clone https://github.com/vwts/deimos
cd Deimos
pnpm i
pnpm build
```

não fechar o terminal ainda.

para corrigir o deimos no seu client discord, rode o seguinte comando e siga o prompt interativo.

```sh
pnpm inject
```

agora feche totalmente o discord. inicie e confirme que o deimos esteja instalado com sucesso checando se você tem a nova sessão deimos nas configurações.

se você sempre precisar voltar para a pasta deimos, apenas abra um novo terminal e escreva `cd Deimos`

todos os plugins são desativados por padrão, então o primeiro passo será abrir as configurações e habilitar os plugins que desejar.

comando para unpatch: `pnpm uninject`

leia o [guia de instalação](docs/1_INSTALLING.md)

## instalação (navegador)

rode os mesmos comandos como o da instalação padrão. agora rode

```sh
pnpm buildWeb
```

você irá encontrar a extensão built em `dist/extension.zip`. agora instale essa extensão no seu navegador.

## contribuindo

veja [CONTRIBUTING.md](CONTRIBUTING.md) e o [guia de plugin](docs/2_PLUGINS.md)

[contribua]: CONTRIBUTING.md

[contribua] [contribua] [contribua] [contribua] [contribua]
