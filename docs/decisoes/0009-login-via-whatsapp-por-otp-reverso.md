# ADR 0009: Login via WhatsApp por OTP reverso

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

Enviar códigos de login por SMS ou WhatsApp tem custo por mensagem. Receber mensagens na API oficial do WhatsApp não tem.

## Decisão

O usuário toca em "Entrar com WhatsApp" e o app abre uma conversa com o número do CabraBom com um código pronto (ex.: `ENTRAR K7F2Q`). Ao receber a mensagem pelo webhook, o backend associa o número ao código e cria uma **sessão de longa duração** em cookie. Vale para prestadores e clientes.

## Alternativas consideradas

- **Código enviado por SMS ou WhatsApp:** custo por mensagem.
- **Login com Google ou e-mail:** gratuito, mas não verifica o número de WhatsApp, que é a identidade do app.

## Consequências

- Positivas: custo zero, sem senha, número verificado e sem erro de digitação.
- Negativas: exige um número de WhatsApp Business conectado à Cloud API e a verificação da empresa na Meta.
