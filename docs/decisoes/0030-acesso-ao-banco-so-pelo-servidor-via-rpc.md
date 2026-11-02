# ADR 0030: Acesso ao banco só pelo servidor, via RPC

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

O Supabase permite que o navegador consulte o banco direto com a chave pública (anon), protegido por políticas de RLS. O CabraBom guarda dados sensíveis: o WhatsApp dos prestadores, o telefone dos clientes e as sessões. A busca usa PostGIS, que não se expressa bem pelos filtros do `supabase-js`.

## Decisão

- O navegador **nunca** fala com o banco. Todo acesso passa pelo servidor Next.js, com o `supabase-js` e a chave `service_role` (em `lib/supabase/server.ts`, marcado com `server-only`).
- Todas as tabelas têm **RLS ligado e nenhuma política**: a chave anon não lê nem escreve nada.
- Consultas geográficas e operações que precisam de transação são **funções SQL** chamadas por RPC (`search_providers`, `distance_to_provider`, `create_provider`, `set_provider_location`). A execução fica revogada para `anon` e `authenticated` e liberada só para `service_role`.
- Um teste (`tests/db/access.test.ts`) garante que a chave anon não chama as funções nem lê as tabelas.

## Alternativas consideradas

- **Consultas do navegador com RLS:** menos código no servidor, mas cada tabela exigiria políticas cuidadosas, e um erro nelas exporia telefones.
- **Conexão Postgres direta (driver `pg`):** funciona, mas exige pool de conexões em ambiente serverless; o RPC sobre HTTP evita isso.

## Consequências

- Positivas: um único ponto de acesso, fácil de auditar; o mesmo código funciona com o banco local ou na nuvem.
- Negativas: toda leitura passa pelo servidor; a chave `service_role` precisa ficar só nas variáveis de ambiente do servidor.
