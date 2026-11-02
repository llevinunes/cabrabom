# ADR 0029: Supabase local via CLI no desenvolvimento

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário e IA

## Contexto

O projeto ainda não tem um Supabase na nuvem, só a conta na Vercel. Chegou a ser considerado expor o banco local pelo ngrok para testar o app publicado.

## Decisão

- Na Fase 1, o banco roda **localmente** com o Supabase CLI (`npx supabase`, instalado como dependência de desenvolvimento) sobre o Docker.
- As migrações ficam em `supabase/migrations/` e os dados de exemplo em `supabase/seed.sql` (`npm run db:reset` recria tudo).
- O `project_id` é `cabrabom`, então os containers aparecem agrupados como **cabrabom** no Docker Desktop.
- Os serviços que a Fase 1 não usa ficam desligados no `supabase/config.toml`: realtime, storage, e-mail, edge functions e analytics. O auth continua ligado só porque é ele que gera as chaves de API exigidas pelo PostgREST; o login do app não usa o Supabase Auth.
- O deploy na Vercel espera um projeto do Supabase na nuvem.

## Alternativas consideradas

- **Expor o banco local pelo ngrok:** descartado pelo usuário. As chaves locais são padrão e públicas, e o app só funcionaria com a máquina ligada.
- **Criar já o projeto na nuvem:** possível no plano gratuito, mas desnecessário enquanto não há deploy.

## Consequências

- Positivas: desenvolvimento e testes sem conta nem custo; o banco é recriado do zero a qualquer momento.
- Negativas: exige Docker; antes do deploy, é preciso criar o projeto na nuvem e aplicar as migrações.
