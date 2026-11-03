# ADR 0020: Design no Figma com variáveis e componentes, e cópia em Markdown

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

As telas precisavam ser editáveis pelo usuário e sobreviver a uma eventual perda de acesso ao Figma.

## Decisão

Telas e painel no Figma com **variáveis de cor** e **componentes** (Botão, Chip, Campo, Card Prestador, Item de menu, Card KPI, Linha de denúncia). Um **guia de design em Markdown** registra tudo, incluindo os SVGs finais e os tokens para o código.

## Alternativas consideradas

- **Só o Figma:** risco de perder o design junto com o acesso.

## Consequências

- Positivas: design editável e documentado em dois lugares.
- Negativas: o guia precisa ser atualizado quando o Figma mudar.
