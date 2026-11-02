# ADR 0035: Dados da busca na URL

- **Status:** Aceita
- **Data:** 2026-11-02
- **Proposta por:** IA

## Contexto

O cliente busca sem login (ADR 0005). O nome, a categoria, os detalhes e a posição dele precisam chegar aos resultados, ao perfil e à mensagem pronta do WhatsApp (spec 3.1 e 3.2), sem banco e sem sessão.

## Decisão

- A busca viaja na URL de `/resultados` e `/p/[id]`, com parâmetros em português como as rotas: `nome`, `categoria`, `detalhes`, `lat`, `lng` e `raio` (mais `livres` e `ordem` para os filtros).
- A posição do cliente vai **arredondada para 3 casas decimais** (cerca de 110 m), tanto ao gerar quanto ao ler a URL. Como as distâncias são exibidas com 0,1 km, o resultado não muda.
- Os textos têm o mesmo limite do formulário (nome até 60, detalhes até 500 caracteres) e são validados pelo mesmo schema. URL fora do formato volta para `/`.
- O app responde com `Referrer-Policy: same-origin`, então essas URLs não são enviadas a outros sites, incluindo o `wa.me`.

## Alternativas consideradas

- **Guardar a busca no servidor (tabela ou cookie):** tira os dados da URL, mas quebra links compartilháveis e o botão voltar, além de criar registros de quem nem chegou a conversar.
- **Posição exata na URL:** mais simples, mas a localização precisa do cliente iria para logs e histórico.

## Consequências

- Positivas: busca sem estado no servidor; o resultado pode ser recarregado ou compartilhado.
- Negativas: o nome e os detalhes ficam no histórico do navegador e nos logs de acesso da hospedagem. Num celular compartilhado, outra pessoa pode ver a busca no histórico.
