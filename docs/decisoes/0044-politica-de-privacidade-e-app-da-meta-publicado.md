# ADR 0044: Política de privacidade e app da Meta publicado

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** IA e usuário

## Contexto

No primeiro deploy, o webhook do WhatsApp recebia os testes do painel da Meta, mas nenhuma mensagem real: com o app da Meta não publicado, ela só entrega webhooks de teste, nem os dos testadores do app. Sem isso, o login não funciona. Para publicar, a Meta exige a URL de uma política de privacidade. A especificação (seção 9) também pede um canal para o usuário pedir a exclusão dos seus dados.

## Decisão

- Página pública `/privacidade`, sem login, com os dados guardados, o que fica visível, por quanto tempo, quem processa os dados e como exercer os direitos da LGPD (IA).
- Contato para pedidos de dados: `llevinsousa@gmail.com` (usuário).
- O app da Meta é publicado com essa URL. O número continua sendo o de teste (IA).

## Alternativas consideradas

- **Manter o app em desenvolvimento:** as mensagens reais não chegam ao webhook, então o login não funciona.
- **Política hospedada fora do app:** mais um lugar para manter atualizado junto com o código.

## Consequências

- Positivas: o login pelo WhatsApp funciona em produção, e o usuário tem um canal claro para pedir a exclusão dos seus dados.
- Negativas: a página precisa acompanhar o que o app guarda. Toda mudança nos dados pessoais guardados deve atualizar a `/privacidade` no mesmo PR.
