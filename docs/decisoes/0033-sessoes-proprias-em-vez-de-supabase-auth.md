# ADR 0033: Sessões próprias em vez do Supabase Auth

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

A identidade no CabraBom é o número de WhatsApp, verificado pelo OTP reverso (ADR 0009). O Supabase Auth faz login por telefone apenas enviando um SMS ou WhatsApp com código, o que tem custo por mensagem (contra o ADR 0010), e não aceita um número verificado por fora.

## Decisão

- O app mantém as próprias sessões na tabela `sessions` (id, telefone e validade de **180 dias**). O id da sessão vai num cookie `session` com `httpOnly`, `sameSite=lax` e `secure` em produção.
- O login ocorre assim: `/entrar` cria a verificação e guarda o id dela num cookie `verification`, também `httpOnly`. O navegador consulta `/api/entrar/status`, que só cria a sessão quando o webhook já confirmou o código. Saber o código não basta: é preciso ter o cookie do navegador que o gerou.
- A sessão não guarda papel; cada página compara o telefone com o dado certo (ADR 0015). O `proxy.ts` só confere se existe o cookie em `/painel` e `/s/`.
- "Sair" apaga a sessão no banco e o cookie.
- Um job diário do pg_cron apaga verificações e sessões vencidas e registros antigos do limite de requisições.

## Alternativas consideradas

- **Supabase Auth com telefone:** exige envio de código pago.
- **Cookie assinado sem tabela (ex.: iron-session):** dispensa o banco, mas não permite encerrar uma sessão no servidor.

## Consequências

- Positivas: login gratuito e sem senha; sessões revogáveis.
- Negativas: o código de sessão é nosso, então segurança e testes também; cada requisição autenticada faz uma consulta na tabela `sessions`.
- Risco aceito (phishing do OTP reverso): alguém pode iniciar um login no próprio navegador e convencer a vítima a enviar a mensagem `ENTRAR XXXXX`, entrando como ela. Sem responder mensagens (ADR 0010), não há como confirmar a origem. A tela avisa "Só envie a mensagem se foi você que pediu para entrar no CabraBom".
