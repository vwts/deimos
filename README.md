# deimos

cliente discord desktop modificado

## recursos

- funciona na última atualização swc do discord que quebrava todos os outros mods
- isolation de contextos proper -> funciona nas versões mais novas do electron (funcionamento confirmado nas versões 13-21)
- patches inline: patch os códigos do discord com substituições regex. veja [o plugin experiments](src/plugins/experiments.ts) para exemplos.
- experiments
- css customizado: manualmente edite `%appdata%/Deimos/settings/quickCss.css` / `~/.config/Deimos/settings/quickCss.css` com seu editor favorito e o cliente irá aplicar as mudanças automaticamente
- diversos plugins úteis - [lista](https://github.com/vwts/deimos/tree/main/src/plugins)

## instalação

certifique-se de ter o node.js e o git instalados. o exemplo abaixo utiliza o pnpm, porém você pode utilizar o npm em vez disso.

```sh
git clone https://github.com/vwts/deimos
cd Deimos
pnpm build
```

as builds agora estão na pasta dist/ (deimos/dist).

agora instale com o script powershell/bash
