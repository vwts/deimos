# guia de contribuição

antes de tudo, obrigado por se disponibilizar para contribuir!

para inserir sua contribuição é robusto, por favor, siga o guia abaixo.

## guia de estilização

- esse projeto possui um .editorconfig minimalista. certifique-se de que seu editor o suporte.
  se estiver utilizando o vscode, ele irá automaticamente recomendar a extensão; caso contrário, por favor instale a extensão editorconfig
- tente seguir a formatação no resto do projeto para continuação consistente
- siga a convention de nomeamento de arquivos. nomes dos arquivos devem geralmente ser em camelcase, a não ser que eles exportam uma classe ou componente react, nesses casos devem ser pascalcase

## contribuindo para um plugin

já que os plugins modificam diretamente o código, incompatibilidades é um problema.

plugins de terceiros (3rd party) não são suportados, todos os plugins fazem parte do deimos em si. desse modo, a compatibilidade é certificada e mantém alta qualidade nos patches.

siga o guia abaixo para fazer seu primeiro plugin!

### encontrando o módulo correto para patch

se a coisa que você deseja patchear é uma ação performada ao interagir com uma parte da ui, utilize o devtools do react.
ele vem pré-instalado e pode ser encontrado na janela "components" do devtools.
utilize o seletor (top left) para selecionar o elemento ui. agora você pode encontrar todas as callbacks, propriedades ou pular para a fonte diretamente.

você pode também clicar em `CTRL + Shift + F` no devtools para abrir a caixa de pesquisa.

### escrevendo um patch robusto

##### "find"

primeiro você deve encontrar um valor `find` agradável. deve ser uma string que será única no seu módulo.
se você deseja capturar a função `getUser`, geralmente uma boa tentativa é `getUser:` ou `function getUser()`, dependendo de como o módulo estiver estruturado. novamente, certifique-se de que seja uma string e que ela seja única no seu módulo e não encontrada em qualquer outro módulo. para verificar isso, pesquise por ela em todos os bundles (`CTRL + Shift + F`)

##### "match"

isso é um regex que irá operar no módulo encontrado por "find".

a maneira mais fácil de escrever e testar seu regex, é da seguinte forma:

- obtenha o id do módulo que você deseja realizar um patch. para fazer isso, vá para a janela de "sources" e suba até você encontrar algo assim: `447887: (e,t,n)=>{` (o número será diferente).
- agora cole o seguinte no console: `Deimos.Webpack.wreq.m[447887].toString()` (alterando o número do seu id)
- agora teste os regex nessa string do console ou utilize alguma ferramenta como o https://regex101.com

#### "replace"

isso é a substituição para o match. é o segundo argumento para [String.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace), então utilize para referir-se com as informações desse docs.

nunca codifique nomes de variáveis ​​ou parâmetros minificados aqui. em vez disso, utilize grupos de captura no seu regex para capturar os nomes da variável e utilize-os na sua substituição.

certifique-se que sua substituição não introduza nenhum espaço em branco. isso inclui espaços, tabs e especialmente newlines.

---

e é isso! agora abra um novo pull request com o seu plugin
