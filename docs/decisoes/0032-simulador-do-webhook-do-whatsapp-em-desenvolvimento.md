# ADR 0032: Simulador do webhook do WhatsApp em desenvolvimento

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário e IA

## Contexto

O login usa OTP reverso (ADR 0009): o usuário envia `ENTRAR K7F2Q` para o número do CabraBom e o webhook da WhatsApp Cloud API confirma o código. O número oficial depende da verificação da empresa na Meta, que ainda não foi feita.

## Decisão

- O fluxo completo fica implementado: geração do código, polling do navegador, sessão e o webhook real em `/api/whatsapp/webhook`, com o `hub.challenge` e a assinatura `X-Hub-Signature-256`. O webhook é ativado pelas variáveis `WHATSAPP_VERIFY_TOKEN` e `META_APP_SECRET`; sem `META_APP_SECRET`, ele recusa tudo (401).
- Em desenvolvimento, a página `/dev/whatsapp` faz o papel da mensagem chegando: recebe um número e um texto e chama a **mesma** função do webhook (`handleIncomingMessages`). Em produção a página dá 404 e a ação recusa.
- A tela `/entrar` mostra o link "Simular mensagem" só fora de produção.

## Alternativas consideradas

- **Esperar o número da Meta:** travaria o cadastro do prestador e todos os testes de ponta a ponta.
- **Login falso por variável de ambiente:** pularia o código que vai para produção.

## Consequências

- Positivas: o login é testado de ponta a ponta (Playwright) com o mesmo código do webhook real.
- Negativas: a assinatura e o formato real do payload da Meta só são exercitados por testes de unidade até o número existir.
