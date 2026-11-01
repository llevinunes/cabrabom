# ADR 0010: Custo zero de mensagens: web push e links compartilhados

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário (requisito) e IA (solução)

## Contexto

O pedido de recomendação, enviado dias depois, precisaria de um template pago da Meta.

## Decisão

Todos os avisos saem por **web push** (gratuito). Quem não ativar as notificações recebe o link pelas mãos do próprio usuário: o prestador compartilha o link pelo WhatsApp dele (`wa.me` ou Web Share API). O link de recomendação só funciona na sessão ou no número do cliente que confirmou.

## Alternativas consideradas

- **Templates pagos da Meta:** mantidos apenas como último recurso, se um dia for necessário.

## Consequências

- Positivas: operação sem custo de mensagens.
- Negativas: no iPhone, o push depende de adicionar o app à tela inicial; o app convida o cliente a fazer isso no momento da confirmação.
