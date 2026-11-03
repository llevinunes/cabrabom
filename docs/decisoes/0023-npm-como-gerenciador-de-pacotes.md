# ADR 0023: npm como gerenciador de pacotes

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

O projeto precisa de um gerenciador de pacotes único, para que o lockfile e os comandos sejam os mesmos em qualquer máquina e na Vercel.

## Decisão

Usar o **npm**, que já vem com o Node.js. O lockfile versionado é o `package-lock.json`.

## Alternativas consideradas

- **pnpm:** instalação mais rápida e econômica em disco, mas exige uma ferramenta a mais para quem estuda o projeto.
- **yarn:** sem vantagem relevante para o projeto.

## Consequências

- Positivas: nada a instalar além do Node.js; documentação e comandos mais simples.
- Negativas: instalações um pouco mais lentas que no pnpm.
