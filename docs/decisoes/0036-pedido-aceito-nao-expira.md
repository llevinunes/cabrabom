# ADR 0036: Pedido aceito não expira

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** IA

## Contexto

A spec (3.6) expira só pedidos `aberta` depois de 2 dias. Depois que o prestador aceita, o cliente precisa abrir o link `/c/` e confirmar, mas pode demorar ou nunca fazer isso. A spec não diz o que acontece com um pedido aceito e nunca confirmado.

## Decisão

- O aceite vale só para pedidos abertos e ainda não expirados, e é idempotente: aceitar de novo devolve o mesmo link do cliente.
- Pedido aceito não expira. Ele fica no painel, na seção "Esperando o cliente confirmar", com o botão "Reenviar link", até o cliente confirmar ou o prestador cancelar.
- Reabrir `/s/[token]` de um pedido aceito mostra de novo o link do cliente (tela 09).

## Alternativas consideradas

- **Expirar aceitos depois de alguns dias:** limpa o painel sozinho, mas inventa um prazo sem dado de uso. Fica para depois do teste em campo.

## Consequências

- Positivas: o prestador nunca perde o link do cliente; nenhuma regra nova de prazo.
- Negativas: pedidos esquecidos acumulam no painel até o prestador cancelar.
