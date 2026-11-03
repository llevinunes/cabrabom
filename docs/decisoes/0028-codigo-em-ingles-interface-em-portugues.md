# ADR 0028: Código em inglês, interface em português

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

A especificação usa nomes em português, inclusive no schema do banco (`prestadores`, `solicitacoes`, `token_prestador`). Bibliotecas, frameworks e exemplos da comunidade estão em inglês, e misturar os dois idiomas nos identificadores deixa o código irregular.

## Decisão

- **Inglês:** funções, variáveis, tipos, componentes, nomes de arquivos e pastas de código, e o schema do banco (tabelas, colunas e funções SQL). Exemplos: `providers`, `service_requests`, `provider_token`, `ProviderCard`.
- **Português:** tudo o que o usuário vê (textos da interface e rotas da URL, como `/prestador` e `/painel`), além de commits, ADRs e documentação.
- Os conceitos da especificação são traduzidos ao nomear; a especificação continua sendo a referência de produto.

## Alternativas consideradas

- **Tudo em português:** fiel à especificação, mas destoa das APIs usadas no código.
- **Código em inglês e banco em português:** exigiria traduzir cada coluna entre o banco e o TypeScript.

## Consequências

- Positivas: código consistente com o ecossistema; um único idioma do banco ao componente.
- Negativas: quem lê a especificação precisa mapear os nomes (ex.: `solicitacoes` → `service_requests`).
