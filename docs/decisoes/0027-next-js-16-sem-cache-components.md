# ADR 0027: Next.js 16 sem Cache Components

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

O `create-next-app` do Next.js 16 liga o `cacheComponents` (e o `partialPrefetching`) por padrão. Com ele ligado, toda leitura de `cookies()` ou `searchParams` fora de um `<Suspense>` é erro de build. No CabraBom quase todas as telas dependem da requisição: a busca e os resultados vêm da URL, e o painel, o login e os links do serviço vêm da sessão.

## Decisão

Desligar o `cacheComponents` e o `partialPrefetching`. As páginas que leem a requisição são renderizadas dinamicamente, no modelo de cache anterior do Next.js, que continua suportado.

## Alternativas consideradas

- **Manter o Cache Components:** a casca estática carrega mais rápido, mas cada tela precisaria de fronteiras `<Suspense>` e diretivas `use cache`. É complexidade demais para um MVP e para quem estuda o projeto.

## Consequências

- Positivas: código de página mais simples e direto.
- Negativas: sem pré-renderização parcial; se o desempenho pedir, dá para reativar e migrar tela por tela (guia "Migrating to Cache Components").
