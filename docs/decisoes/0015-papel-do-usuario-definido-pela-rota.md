# ADR 0015: Papel do usuário definido pela rota

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA (aceita pelo usuário)

## Contexto

O app atende clientes e prestadores, e a mesma pessoa pode ter os dois papéis.

## Decisão

Não existe tela "Você é cliente ou prestador?". **A rota define o papel**: `/` é a busca do cliente; `/prestador`, `/painel` e `/s/` são do prestador; `/c/` e `/r/` são do cliente. A sessão não guarda papel; cada rota compara o número da sessão com o dado certo. A busca tem o link "Sou prestador" (ou "Meu painel" para prestadores logados). `/prestador` também serve como link de captação.

## Alternativas consideradas

- **Tela de escolha na entrada:** um passo a mais para a maioria (clientes) e uma identidade rígida que o sistema não precisa.

## Consequências

- Positivas: menos atrito; uma pessoa pode ser cliente e prestador.
- Negativas: a verificação de papel precisa estar em cada página do servidor, não só no middleware.
