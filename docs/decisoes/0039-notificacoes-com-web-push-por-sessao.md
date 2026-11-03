# ADR 0039: Notificações com web push, ligadas à sessão

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** IA e usuário

## Contexto

O prestador acompanha o serviço pelo WhatsApp com o cliente e pelas notificações do CabraBom (usuário). A spec (seção 5) pede web push com service worker, a biblioteca `web-push` e chaves VAPID, sem cadastro extra, e o app nunca envia mensagens pela API do WhatsApp.

## Decisão

- Biblioteca `web-push` no servidor, com as chaves `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT`. Sem as três, as notificações ficam desligadas (desenvolvimento).
- Cada inscrição fica na tabela `push_subscriptions`, ligada a uma **sessão**. Sair apaga as inscrições daquela sessão. Uma mensagem para um número vai para todas as inscrições das sessões válidas desse número.
- O envio acontece depois da resposta (`after()` do Next) e nunca lança erro: uma notificação que falha não desfaz nem bloqueia o aceite, a confirmação ou a finalização. Inscrições que o serviço de push responde com 404 ou 410 são apagadas.
- **iPhone:** o app adicionado à tela inicial não compartilha o login com o Safari. Quem instala entra pelo WhatsApp de novo dentro do app antes de ativar as notificações. Aceito para o teste em campo (usuário).

## Alternativas consideradas

- **Inscrição ligada ao telefone por um link assinado:** evitaria o segundo login no iPhone, mas muda o modelo de dados e fica para depois do teste em campo.
- **Mensagens pelo WhatsApp:** pagas e contra a spec.

## Consequências

- Positivas: sem custo, sem cadastro extra, e o ciclo do serviço não depende do push.
- Negativas: quem não ativa as notificações (ou usa iPhone sem instalar) só recebe pelo WhatsApp e pelo painel.
