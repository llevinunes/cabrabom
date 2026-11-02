# CabraBom

## Referências

Antes de trabalhar, leia:

- `referencias/cabrabom-especificacao.md`: especificação do produto
- `referencias/cabrabom-guia-de-design.md`: identidade, componentes e telas
- `referencias/design-examples/`: telas de referência
- `docs/decisoes/`: decisões já tomadas (ADRs)

`referencias/` e `docs/superpowers/` são material local e não vão para o repositório (ver `.gitignore`).

## Decisões (ADRs)

Toda decisão importante do projeto vira um ADR em `docs/decisoes/`, no mesmo PR da mudança. Conta como importante qualquer escolha de arquitetura, biblioteca, ferramenta, fluxo, regra de negócio ou de segurança, ou qualquer escolha que mude uma decisão anterior.

- Copie `docs/decisoes/0000-modelo.md` e use o próximo número livre.
- Preencha **Proposta por** (Usuário, IA ou ambos) e a data do dia.
- Adicione a linha correspondente na tabela de `docs/decisoes/README.md`.
- Não apague ADRs antigos. Quando uma decisão muda, o antigo recebe o status **Substituída por ADR NNNN**.

## Versão

Todo PR sobe a versão no `package.json` uma única vez, de acordo com o peso da mudança:

- **Segundo número (minor)**, ex.: `0.3.0 → 0.4.0`: funcionalidade nova, mudança de comportamento visível ao usuário ou migração de banco.
- **Terceiro número (patch)**, ex.: `0.3.0 → 0.3.1`: correção, ajuste visual, refatoração, testes, documentação ou configuração.

O primeiro número só muda por decisão explícita do usuário. Use `npm version minor --no-git-tag-version` ou `npm version patch --no-git-tag-version` e faça o commit como `chore: versão X.Y.Z`.

## Idioma

- **Inglês:** funções, variáveis, tipos, componentes, nomes de arquivos e pastas de código, e o schema do banco (tabelas, colunas, funções SQL).
- **Português:** textos da interface, rotas da URL (`/prestador`, `/painel`, `/entrar`...), commits, ADRs e documentação.

## Git

- Siga o fluxo de `develop`, branches `feature/*` e pull requests revisados pelo usuário. Nunca faça o merge você mesmo.
- Escreva commits curtos em Conventional Commits, em português.
- Use npm como gerenciador de pacotes.
