# deimos

cliente discord desktop modificado

## recursos

- isolation de contextos proper -> funciona nas versões mais novas do electron (funcionamento confirmado nas versões 13-21)
- patches inline: patch os códigos do discord com substituições regex. veja [o plugin experiments](src/plugins/experiments.ts) para exemplos.
- css customizado: manualmente edite `%appdata%/Deimos/settings/quickCss.css` / `~/.config/Deimos/settings/quickCss.css` com seu editor favorito e o cliente irá aplicar as mudanças automaticamente
- plugins úteis - [lista](https://github.com/vwts/deimos/tree/main/src/plugins)

## instalação

```sh
pnpm install
pnpm build

./install.sh
```
