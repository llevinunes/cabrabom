# ADR 0021: Painel de gerência em /gerencia, no mesmo app

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA (estrutura) e usuário (conteúdo: métricas e denúncias)

## Contexto

A gerência precisa acompanhar métricas do funil e moderar denúncias.

## Decisão

Um painel web em **`/gerencia`**, no mesmo app Next.js, com: indicadores (contatos, taxa de aceite, concluídos, prestadores ativos, denúncias abertas), funil de serviços, categorias mais buscadas, contatos por dia, alertas antifraude e tabela de denúncias. O acesso é restrito a administradores (forma de identificação ainda em aberto).

## Alternativas consideradas

- **App separado para a gerência:** duplicaria login, tipos e estilos sem necessidade no MVP.

## Consequências

- Positivas: reaproveita banco, sessão e componentes.
- Negativas: a rota é pública no código aberto, então a proteção depende inteiramente das verificações no servidor.
