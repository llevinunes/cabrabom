# ADR 0038: Recomendação uma hora depois e sinalização de abuso

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** Usuário e IA

## Contexto

A spec (seção 6) pede um intervalo mínimo entre a confirmação e a recomendação ("algumas horas") e a sinalização, sem bloqueio, de números que recomendam muitos prestadores em pouco tempo. Em serviços rápidos, um intervalo longo faz o cliente finalizar antes de poder recomendar e não voltar mais.

## Decisão

- A recomendação só é aceita **1 hora** depois de `client_confirmed_at` (usuário).
- Se o cliente finalizar antes disso, a tela `/r` mostra a partir de que horário ele pode recomendar; o mesmo link continua valendo (IA).
- Um número que já recomendou **3 ou mais prestadores diferentes nos últimos 7 dias** tem a nova recomendação publicada com `flagged = true`, para revisão manual pelo painel do Supabase (IA).
- As regras rodam numa função SQL (`create_recommendation`), na mesma transação do insert: telefone do cliente diferente do prestador, um telefone por prestador (índice único), status `completed`, intervalo mínimo.
- Comentário com até 500 caracteres; ao menos um destaque ou um comentário (IA).

## Alternativas consideradas

- **2 horas ou mais:** mais seguro contra fraude, mas perde recomendações de serviços curtos.
- **Bloquear números sinalizados:** a spec pede revisão manual, não bloqueio.

## Consequências

- Positivas: a fraude continua trabalhosa (precisa de outro número e de esperar), e recomendações de serviços rápidos não se perdem.
- Negativas: a sinalização depende de alguém olhar o banco; não há tela para isso ainda.
