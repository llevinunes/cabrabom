# ADR 0001: App web mobile-first (PWA) com Next.js

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

O público (prestadores e clientes) usa principalmente o celular, muitas vezes com internet limitada. Publicar em lojas de aplicativo exige contas pagas, revisão e duas bases de código.

## Decisão

Construir um app **web mobile-first**, instalável como **PWA**, com **Next.js (App Router)** e Tailwind. Todo o layout parte de telas de 390 px.

## Alternativas consideradas

- **App nativo (iOS e Android):** melhor integração, mas custo e tempo muito maiores para um MVP.
- **React Native / Expo:** uma base só, mas ainda exige publicação nas lojas.

## Consequências

- Positivas: um link basta para usar; atualizações instantâneas; o prestador pode "instalar" o app na tela inicial.
- Negativas: no iPhone, notificações push só funcionam com o app adicionado à tela inicial (ver ADR 0010).
