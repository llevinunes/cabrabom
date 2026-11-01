# ADR 0011: Regras antifraude das recomendações

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

Com recomendações só positivas, o risco principal é o prestador inflar o próprio perfil.

## Decisão

Uma recomendação só é publicada se o telefone do cliente for verificado, **diferente do telefone do prestador**, inédito para aquele prestador (índice único no banco), após um intervalo mínimo desde a confirmação e com a solicitação concluída. Números que recomendam muitos prestadores em pouco tempo são **sinalizados** para revisão, não bloqueados. Tokens são aleatórios e longos.

## Alternativas consideradas

- **Bloqueio automático de padrões suspeitos:** arriscado sem dados reais; preferiu-se a revisão humana.

## Consequências

- Positivas: a fraude fica trabalhosa o bastante para não valer a pena em escala.
- Negativas: não elimina fraude feita com chips de parentes; parte depende da moderação.
