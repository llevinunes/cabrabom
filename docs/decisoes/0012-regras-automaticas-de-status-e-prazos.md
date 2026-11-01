# ADR 0012: Regras automáticas de status e prazos

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

O status "ocupado" desatualizado prejudica a busca, e solicitações sem resposta acumulam.

## Decisão

- O prestador fica **ocupado automaticamente** quando um serviço entra em andamento.
- Ao finalizar, volta a **livre automaticamente**, se não tiver outro serviço em andamento.
- O **cliente também pode marcar** o serviço como finalizado.
- Solicitações abertas **expiram após 2 dias** sem aceite (`pg_cron`).
- Após **3 dias ocupado**, o prestador recebe um lembrete por push (Vercel Cron).

## Alternativas consideradas

- **Status totalmente manual:** dependeria da memória do prestador.

## Consequências

- Positivas: a busca reflete a disponibilidade real; o funil registra os contatos perdidos.
- Negativas: exige rotinas agendadas e cuidado para atualizar `ocupado_atualizado_em` em toda mudança.
