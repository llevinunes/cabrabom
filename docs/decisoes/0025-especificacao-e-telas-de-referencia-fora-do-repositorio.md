# ADR 0025: Especificação e telas de referência fora do repositório

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

A especificação do MVP, o guia de design, as imagens das telas e os rascunhos de planejamento feitos com a IA são material de trabalho. O ADR 0017 previa um repositório com tudo num só lugar, e o ADR 0020 previa uma cópia do design em Markdown.

## Decisão

Esse material fica **localmente**, em `referencias/` (especificação, guia de design e telas) e em `docs/superpowers/` (design e planos de implementação), e as duas pastas entram no `.gitignore`. O repositório guarda o que vale para quem lê o código: os ADRs, o logo e o README.

## Alternativas consideradas

- **Versionar tudo (ADR 0017):** expõe documentos de trabalho que mudam muito e não interessam a quem usa o código.

## Consequências

- Positivas: o repositório fica enxuto e as decisões ficam registradas nos ADRs.
- Negativas: a cópia de segurança do design prevista no ADR 0020 depende de backup local; quem clona o projeto não vê as telas de referência.
