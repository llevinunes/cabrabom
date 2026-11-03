# ADR 0013: Busca: raio e ordenação

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário (raios) e IA (ordenação)

## Contexto

O cliente precisa ver primeiro quem pode atender agora, e perto.

## Decisão

Raio **padrão de 10 km**, ajustável até **100 km** (limite também aplicado no backend). Ordenação: **livres primeiro**, depois **distância**, com o número de recomendações como desempate. A localização vem do GPS ou do CEP. A localização do prestador aparece só como bairro e distância arredondada.

## Alternativas consideradas

- **Ordenar por recomendações primeiro:** prestadores novos nunca apareceriam no topo.

## Consequências

- Positivas: resultados úteis e justos com quem está começando; privacidade do endereço do prestador.
- Negativas: em áreas rurais, raios grandes podem trazer muitos ocupados no fim da lista.
