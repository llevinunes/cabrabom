# ADR 0034: Localização do prestador arredondada

- **Status:** Aceita
- **Data:** 2026-11-02
- **Proposta por:** IA (risco apontado na revisão) e usuário (escolha da precisão)

## Contexto

A tela só mostra o bairro e a distância arredondada (spec, seção 9). Mas, se o banco guardar o ponto exato do GPS, a busca devolve a distância com 0,1 km de precisão a partir de um ponto escolhido por quem busca. Buscando de três pontos diferentes, dá para triangular a casa do prestador em cerca de 100 m.

## Decisão

A localização do prestador é gravada arredondada para **2 casas decimais** (cerca de 1,1 km), pela função `coarse_point` do banco. Todas as escritas passam por ela: `create_provider`, `set_provider_location` e o seed. A distância exibida passa a ser aproximada, como a spec já descreve ("distância aproximada").

## Alternativas consideradas

- **3 casas decimais (~110 m):** distâncias mais fiéis, mas ainda chega perto da rua.
- **Precisão total:** distâncias exatas, com o risco de triangulação.
- **Arredondar só a distância exibida:** não resolve; a triangulação usa várias distâncias.

## Consequências

- Positivas: a casa do prestador não pode ser localizada pela busca; a regra vale para qualquer caminho de escrita.
- Negativas: a distância pode variar em até cerca de 0,8 km em relação à real, e a ordenação por distância fica aproximada entre prestadores muito próximos.
