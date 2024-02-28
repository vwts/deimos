# guia de plugins

bem-vindo(a) ao guia de plugins! nesse arquivo, você irá aprender sobre como escrever seu próprio plugin!

não será preciso rodar `pnpm build` para cada vez que você fazer alguma mudança. em vez disso, utilize `pnpm watch` - isso irá auto-compilar o deimos toda vez que você fizer uma mudança. se estiver utilizando patches de código (recomendado), será preciso CTRL + R para carregar as mudanças.

## ponto de entrada do plugin

1. crie uma pasta em `src/plugins/` com o nome do seu plugin. por exemplo, `src/plugins/meuPlugin/` - todos os arquivos do seu plugin estarão aí.

2. crie um arquivo nessa pasta chamado `index.ts`

3. no `index.ts`, copie e cole o seguinte template de código:

```ts
import definePlugin from '../../utils/types';

export default definePlugin({
    name: "meu plugin",
    description: "essa é a descrição do meu novo plugin",

    authors: [
        {
            id: "o id do seu usuário do discord",
            name: "seu nome",
        },
    ],

    patches: [],

    // delete esses dois abaixo se você estiver utilizando apenas patches de código
    start() {},
    stop() {}
});
```

altere o nome, descrição e autores para suas próprias informações.

## como os plugins funcionam no deimos

o deimos utiliza um método diferente para criação de mods. em vez de ser por webpack monkeypatching, você modifica diretamente o código antes do discord o carregar.

isso é _significamente_ mais eficiente que o webpack monkeypatching, e é surpreendentemente fácil, mas pode ser meio confuso de primeira impressão.

## criando sua patch

para um guia profundo para compactação de código, veja [CONTRIBUTING.md](../CONTRIBUTING.md)

no arquivo `index.ts` feito anteriormente, você verá um array de `patches`.

> você verá exemplos de como os patches são utilizados em todos os plugins existentes, e será mais fácil de entender vendo os exemplos, então faça isso antes, e depois volte para cá!

> para um bom exemplo de um plugin utilizando os patches de código E compactação runtime, veja `src/plugins/unindent.ts`, que utiliza patches de código para rodar um código runtime customizado

um dos patches no plugin `isStaff`, se parece com isso:

```ts
{
	match: /(\w+)\.isStaff=function\(\){return\s*!1};/,
    replace: "$1.isStaff=function(){return true};"
}
```

o regex acima coincide com uma string que o discord estará de olho, como:

```js
abc.isStaff = function () {
	return !1;
};
```

lembre-se que esse código do discord está minimizado, então não haverá nenhuma newline aqui, e aqui terá apenas espaços caso necessário. então o código fonte se parecerá com algo assim:

```
abc.isStaff=function(){return!1;}
```

você pode encontrar esses snippets abrindo o devtools (`ctrl + shift + i`) e pressionando `ctrl + shift + f`, pesquisando pelo que você deseja para o modificar, e fazendo do arquivo algo mais legível.

no regex do `match` no exemplo mostrado acima, você irá noticiar no início que há um `(\W+)`.
qualquer coisa que tiver nas brackets será acessível na string `replace` utilizando `$<número>`. exemplo, o primeiro par de brackets será `$1`, o segundo será `$2`, etc.

a string do `replacement` utilizado será:

```
"$1.isStaff=function(){return true;};"
```

que, utilizando o exemplo acima, substituirá o código por:

> :exclamation: nesse exemplo, `$1` será `abc`

```js
abc.isStaff = function () {
	return true;
};
```

o valor match _pode_ ser uma string, em vez de regex, porém geralmente o regex se sairá melhor, já que pode trabalhar com valores desconhecidos, aonde as strings devem coincidir exatamente.

uma vez feito o seu plugin, certifique-se de rodar `pnpm lint` para verificar que seu código esteja correto e limpo, e então abra uma pull request no github :)

> :exclamation: certifique-se de ter lido [CONTRIBUTING.md](../CONTRIBUTING.md) antes de abrir uma pull request
