# ADR 0040: Lembretes de três dias

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** Usuário

## Contexto

A spec (3.6 e 5) prevê dois lembretes para o prestador: "Finalizou o serviço?" (sem prazo) e "Você ainda está ocupado?" depois de 3 dias ocupado. Quando o cliente confirma, o prestador fica ocupado automaticamente, então os dois cairiam no mesmo dia.

## Decisão

- **Lembrete de finalizar:** uma vez, 3 dias depois de `client_confirmed_at`, se o serviço ainda estiver em andamento. A mensagem lembra de finalizar no app para receber recomendações dos clientes.
- **Lembrete de ocupado:** uma vez, 3 dias depois de o prestador se marcar como ocupado (`busy_updated_at`), **só se não tiver serviço em andamento**. Se ele confirmar que continua ocupado, a contagem recomeça.
- Nunca os dois para o mesmo prestador pelo mesmo motivo; cada envio fica registrado (`finish_reminder_sent_at`, `busy_reminder_sent_at`).
- Uma rotina diária (Vercel Cron, às 9h de Fortaleza) envia os lembretes.

## Alternativas consideradas

- **Lembrete de dois dias:** proposto e descartado pelo usuário.
- **Repetir o lembrete todo dia:** cansativo; anti-objetivo do design da Fase 2.

## Consequências

- Positivas: o prestador recebe um aviso por motivo, no máximo, e o de finalizar aponta o benefício (recomendações).
- Negativas: com a rotina diária, o lembrete chega entre o 3º e o 4º dia.
