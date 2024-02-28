# guia de instalação

bem-vindo(a) ao guia de instalação! nesse arquivo, você irá aprender sobre como baixar, instalar e desinstalar o deimos!

## sessões

- [dependências](#dependências)
- [instalando o deimos](#instalando-o-deimos)
- [atualizando o deimos](#atualizando-o-deimos)
- [desinstalando o deimos](#desinstalando-o-deimos)
- [instalando manualmente o deimos](#instalando-o-deimos-manualmente)
- [desinstalando manualmente o deimos](#desinstalando-o-deimos-manualmente)

## dependências

- instale o git em: https://git-scm.com/download
- instale o node.js lts em: https://nodejs.dev/en/

## instalando o deimos

> :exclamation: se isso não funcionar, veja [instalando o deimos manualmente](#instalando-o-deimos-manualmente)

instalando o `pnpm`:

> :exclamation: talvez precise rodar como administrador dependendo do seu sistema, e talvez fechar e re-abrir seu terminal

```shell
npm i -g pnpm
```

clonando o deimos:

```shell
git clone https://github.com/vwts/deimos

cd deimos
```

instalando as dependências:

```shell
pnpm install
```

construindo o deimos:

```shell
pnpm build
```

injetando o deimos no seu client:

```shell
pnpm inject
```

isso fecha totalmente o seu discord da sua barra de tarefas ou gerenciador de tarefas, e o reinicia. o deimos deve ser injetado - você pode checar isso olhando pela sessão deimos nas configurações do discord.

## atualizando o deimos

se você já estiver utilizando o discord, vá para a aba `updater` nas configurações.

algumas vezes será necessário atualizar manualmente se o updater de gui falhar.

para puxar as últimas mudanças:

```shell
git pull
```

se isso falhar, você talvez precisará resetar suas mudanças locais para o deimos para resolver erros de merge:

> :exclamation: esse comando irá remover qualquer mudança local que você fez ao deimos. certifique-se de restaurar se você fez qualquer mudanças no código que você não quer perder

```shell
git reset --hard
git pull
```

e então, construa as mudanças:

```shell
pnpm build
```

e então, reinicie seu client

## desinstalando o deimos

apenas rode:

```shell
pnpm uninject
```

o comando acima talvez te perguntará para rodar isso:

```shell
pnpm install
pnpm uninject
```

## instalando o deimos manualmente

- [windows](#para-windows)
- [linux](#para-linux)
- [macos](#para-macos)

### para windows

pressione `Win+R` e vá para `%LocalAppData%` e clique em enter. nessa página, encontre a página (discord, discordptb, discordcanary, etc) que você deseja compactar.

agora siga as instruções em [patching manual](#patching-manual)

### para linux

a pasta discord está geralmente em um desses paths:

- /usr/share
- /usr/lib64
- /opt
- /home/$USER/.local/share

se você utiliza flatpak, estará então em um dos seguintes paths:

- /var/lib/flatpak/app/com.discordapp.Discord/current/active/files
- /home/$USER/.local/share/flatpak/app/com.discordapp.Discord/current/active/files

você precisará fornecer o acesso platpak para o deimos a partir de um desses seguintes comandos:

> :exclamation: se não for a versão stable, substitua `com.discordapp.Discord` pelo nome da sua branch, exemplo: `com.discordapp.DiscordCanary`

> :exclamation: substitua `/path/to/Deimos/` pelo path da sua pasta deimos (MENOS a pasta dist)

se a instalação do flatpak do discord estiver em /home/:

```shell
flatpak override --user com.discordapp.Discord --filesystem="/path/to/deimos/"
```

se a instalação do flatpak do discord não estiver em /home/:

```shell
sudo flatpak override com.discordapp.Discord --filesystem="/path/to/deimos"
```

agora siga as instruções em [patching manual](#patching-manual)

### para macos

abra o finder e vá para sua pasta de application. clique com botão direito no aplicativo discord que você deseja compactar e veja os conteúdos.

vá para a pasta `Contents/Resources`.

agora siga as instruções em [patching manual](#patching-manual)

### patching manual

> :exclamation: se estiver utilizando o flatpak no linux, vá para a pasta que contém o arquivo `app.asar`, e pule para aonde a pasta `app` foi criada

> :exclamation: no linux/macos, há uma chance de não tiver a pasta `app-<número>`, mas provavelmente é uma pasta `resources`, então continuar leitura :)

dentro disso, veja as pastas `app-<número>`. se você possui múltiplos, use o maior número. se isso não funcionar, faça o mesmo para o resto das pastas `app-<número>`.

dentro disso, vá para a pasta `resources`. lá deve haver um arquivo chamado `app.asar`. caso contrário, veja outra pasta `app-<número>` em vez disso.

faça uma nova pasta em `resources` chamada `app`. dentro dela, criar dois novos arquivos:

`package.json` e `index.js`

em `index.js`:

> :exclamation: substitua o path na primeira linha pelo path para `patcher.js` na sua pasta dist do deimos.
> no windows, você pode obter isso clicando em shift + clique direito no arquivo patcher.js e selecionando "copiar como path"

```js
require("C:/Users/<seu usuário>/path/to/vencord/dist/patcher.js");
require("../app.asar");
```

já no `package.json`:

```json
{ "name": "discord", "main": "index.js" }
```

finalmente, feche totalmente e re-abra seu client discord e cheque se o `deimos` aparece nas configurações!

## desinstalando o deimos manualmente

> :exclamation: não delete `app.asar` - delete apenas a pasta `app` que foi criada

use as instruções acima para encontrar a pasta `app`, e delete-a. e então, feche e re-abra seu discord.
