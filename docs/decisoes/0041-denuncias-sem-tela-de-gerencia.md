# ADR 0041: Denúncias sem tela de gerência

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** Usuário

## Contexto

A spec (3.5) pede um botão discreto **Relatar problema** no perfil e nos links do serviço, com a denúncia chegando só ao administrador, que pode ocultar o prestador ou uma recomendação. A tela de gerência (`/gerencia`, ADR 0021) ficou para depois do primeiro teste em campo.

## Decisão

- O botão existe no perfil público (`/p/[id]`) e nas telas do serviço (`/s`, `/c`, `/r`) e leva a `/relatar`, um formulário curto, sem login, com limite de 5 relatos por hora por IP.
- A denúncia fica na tabela `reports` (prestador, serviço quando houver, descrição até 1000 caracteres, `resolved`). Nunca aparece em tela pública.
- O administrador lê e trata as denúncias **pelo painel do Supabase**: marca `resolved`, oculta um prestador (`providers.hidden = true`) ou uma recomendação (`recommendations.visible = false`), e confere as recomendações com `flagged = true` (ADR 0038).

## Alternativas consideradas

- **Tela `/gerencia` já no primeiro deploy:** mais trabalho antes do teste em campo, com poucos usuários e um administrador só.

## Consequências

- Positivas: a moderação existe desde o primeiro deploy sem construir interface.
- Negativas: depende de acesso ao painel do Supabase e de alguém olhar as denúncias; não há aviso quando chega uma nova.
