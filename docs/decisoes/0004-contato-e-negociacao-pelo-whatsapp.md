# ADR 0004: Contato e negociação pelo WhatsApp

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

Prestadores e clientes já negociam pelo WhatsApp. Construir um chat próprio seria caro e competiria com um hábito consolidado.

## Decisão

O botão **"Conversar no WhatsApp"** abre um link `wa.me` com uma mensagem pronta, montada a partir da categoria e dos detalhes do pedido. A mensagem identifica o CabraBom ("Encontrei você no CabraBom") e leva o link de aceite (ADR 0008). O app não intermedeia preço nem pagamento.

## Alternativas consideradas

- **Chat dentro do app:** controle total, mas alto custo de construção e baixa adesão.

## Consequências

- Positivas: zero atrito; o prestador percebe que o app traz clientes.
- Negativas: a conversa acontece fora do app, então o acompanhamento depende dos links do ciclo do serviço.
