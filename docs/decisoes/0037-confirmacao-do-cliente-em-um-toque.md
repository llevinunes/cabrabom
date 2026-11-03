# ADR 0037: Confirmação do cliente em um toque

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** IA

## Contexto

Na tela 04, o cliente toca em "Confirmar com WhatsApp" e precisa fazer login (spec 3.3, passo 2). Depois do login ele volta para a mesma página. Se a confirmação dependesse de um segundo toque, o cliente, que muitas vezes nunca usou o app, poderia achar que já tinha confirmado.

## Decisão

- Com sessão, o toque confirma direto.
- Sem sessão, a action grava um cookie assinado (`pending_confirmation`, 15 minutos) com o token do serviço e manda para `/entrar?voltar=/c/{token}/concluir`. A rota `concluir` só confirma se o cookie existir e tiver o mesmo token da URL; depois apaga o cookie e volta para `/c/{token}`, já na tela 05.
- Um GET em `concluir` sem esse cookie não confirma nada, então um link malicioso não confirma em nome de ninguém.
- A função que confirma com um telefone fica num módulo `server-only`, nunca exportada de um arquivo `"use server"`.

## Alternativas consideradas

- **Segundo botão depois do login:** mais simples, mas um passo a mais para quem está aprendendo o app.
- **Confirmar no GET de `/c/{token}` logo depois do login:** qualquer link aberto por alguém logado confirmaria o serviço.

## Consequências

- Positivas: um toque só do ponto de vista do cliente; mesmo padrão do cadastro do prestador (`/prestador/concluir`).
- Negativas: se o login demorar mais de 15 minutos, o cliente volta para a tela 04 e toca de novo.
