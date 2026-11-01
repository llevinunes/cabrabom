# ADR 0003: Fotos e vídeos em object storage com URL assinada

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

Prestadores vão enviar fotos e vídeos do portfólio pelo celular, em redes móveis.

## Decisão

Arquivos **nunca** ficam no banco: vão para um object storage (Supabase Storage ou Cloudflare R2) e o banco guarda só a URL. O upload vai **direto do celular para o storage**, por URL assinada. Imagens são comprimidas no navegador; vídeos têm limite de duração e tamanho no MVP. Fotos e vídeos do pedido do cliente ficam fora da primeira versão.

## Alternativas consideradas

- **Arquivos no banco:** caro, lento e difícil de servir.
- **Upload passando pelo servidor Next.js:** esbarra em limites de tamanho de requisição e consome banda.

## Consequências

- Positivas: barato, rápido e escalável.
- Negativas: vídeos pesados no futuro vão exigir um serviço de transcodificação (Cloudflare Stream ou Mux).
