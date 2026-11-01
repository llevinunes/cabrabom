# ADR 0008: Ciclo do serviço com aceite pelo link da primeira mensagem

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário (com ajustes da IA)

## Contexto

Era preciso provar que um serviço aconteceu antes de liberar uma recomendação, e saber o WhatsApp do cliente para o pedido de recomendação.

## Decisão

A mensagem inicial leva o link **`/s/[token]`**. O prestador, logado, **aceita** e recebe o link **`/c/[token]`** para enviar ao cliente. O cliente abre, **confirma pelo WhatsApp** (login) e o serviço fica em andamento. Ao **finalizar** (pelo prestador ou pelo cliente), o cliente pode **recomendar** em `/r/[token]`.

Estados: `aberta → aceita → em_andamento → concluida → recomendada`, além de `cancelada` e `expirada`.

## Alternativas consideradas

- **Código enviado ao prestador para validar a recomendação** (proposta do usuário): descartada, porque o código iria justamente para quem tem interesse em fraudar.
- **Código junto com o link para o cliente:** descartado, porque os dois viajariam na mesma mensagem e o código não acrescentaria segurança.
- **Link de "terminou o serviço?" na primeira mensagem:** substituído pelo fluxo de aceite, que registra todo o ciclo.

## Consequências

- Positivas: funil completo (contatos → aceitos → confirmados → concluídos → recomendados); o WhatsApp do cliente fica verificado.
- Negativas: mais passos; o link de aceite exige login do prestador porque também fica no WhatsApp do cliente.
