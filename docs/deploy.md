# Primeiro deploy

Guia para colocar o CabraBom no ar para o primeiro teste em campo (ADR 0042): **Vercel** (app), **Supabase Cloud** (banco) e o **número de teste da Meta** (login pelo WhatsApp), todos nos planos gratuitos.

O deploy de produção sai da branch `main`. Antes de começar, o `develop` precisa ter sido levado para a `main` (PR `develop → main`).

## 1. Banco: Supabase Cloud

1. Em <https://supabase.com/dashboard>, crie um projeto. Use a região **South America (São Paulo)** e guarde a senha do banco.
2. As migrações são aplicadas pelo GitHub Actions a cada merge na `main` (ADR 0043). Em <https://github.com/llevinunes/cabrabom/settings/secrets/actions>, crie três segredos de repositório:

   | Segredo | Valor |
   |---|---|
   | `SUPABASE_ACCESS_TOKEN` | um token criado em <https://supabase.com/dashboard/account/tokens> |
   | `SUPABASE_DB_PASSWORD` | a senha do banco do passo 1.1 |
   | `SUPABASE_PROJECT_ID` | o ref do projeto, o código na URL do painel (`/project/<ref>`) |

   No merge do `develop → main`, o workflow **Migrações** aplica todas as migrações. Elas ativam o PostGIS e o pg_cron e criam as 7 categorias. Os prestadores de exemplo (`supabase/seed.sql`) **não** vão para produção. Confira na aba **Actions** que a execução ficou verde. Para rodar de novo sem merge, use **Run workflow** nessa aba.

   Se preferir aplicar à mão, no terminal do Mac, na pasta do projeto atualizada:

   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-do-projeto>
   npx supabase db push
   ```
3. Em **Project Settings → API**, copie a **Project URL** (`SUPABASE_URL`) e a chave **service_role** (`SUPABASE_SERVICE_ROLE_KEY`). Essa chave dá acesso total ao banco: nunca coloque em código nem em variável `NEXT_PUBLIC_`.
4. Confira em **Database → Cron Jobs** que existem `expire-service-requests` e `clean-login-data`.

## 2. WhatsApp: número de teste da Meta

1. Em <https://developers.facebook.com/apps>, clique em **Criar app**:
   - em **Casos de uso**, marque só **Conectar-se com clientes pelo WhatsApp**;
   - em **Empresa**, escolha ou crie um portfólio empresarial (não precisa verificar a empresa para o número de teste);
   - conclua **Requisitos** e **Visão geral** e crie o app.
2. No app, abra o caso de uso do WhatsApp em **Configuração básica → Etapa 1. Experimente**:
   - o número de teste aparece em **Número de teste**. Ele é dos EUA: `+1 (555) 123-4567` vai em `WHATSAPP_CABRABOM_NUMBER` como `15551234567` (só dígitos, com o código do país);
   - em **Destinatário**, cadastre e verifique os telefones do grupo de teste (até **5**, somando prestadores e clientes). Mande a mensagem de exemplo para cada um para conferir;
   - o **Token de acesso** não é usado: o CabraBom só recebe mensagens, nunca envia.
3. Em **App settings → Basic**, copie o **App secret** (`META_APP_SECRET`).
4. Invente um texto longo e aleatório para `WHATSAPP_VERIFY_TOKEN` (o mesmo comando do item 3.2 serve).
5. O webhook só pode ser configurado depois do deploy da Vercel (passo 4).

## 3. Segredos

1. Chaves das notificações:

   ```bash
   npx web-push generate-vapid-keys
   ```

   `Public Key` vai em `VAPID_PUBLIC_KEY`, `Private Key` em `VAPID_PRIVATE_KEY`. Em `VAPID_SUBJECT`, um contato: `mailto:seu-email@exemplo.com`.
2. `COOKIE_SECRET` e `CRON_SECRET`, um valor diferente para cada:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

## 4. App: Vercel

1. Em <https://vercel.com/new>, importe o repositório. Framework: Next.js (detectado). Branch de produção: `main`.
2. Em **Settings → Environment Variables**, para o ambiente **Production**:

   | Variável | Valor |
   |---|---|
   | `SUPABASE_URL` | Project URL do Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave service_role do Supabase |
   | `APP_URL` | o endereço do app, ex.: `https://cabrabom.vercel.app` |
   | `COOKIE_SECRET` | passo 3.2 |
   | `WHATSAPP_CABRABOM_NUMBER` | número de teste da Meta, só dígitos |
   | `WHATSAPP_VERIFY_TOKEN` | passo 2.4 |
   | `META_APP_SECRET` | passo 2.3 |
   | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | passo 3.1 |
   | `CRON_SECRET` | passo 3.2 |

   Sem `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET` ou `CRON_SECRET`, ou com um `APP_URL` que não seja o endereço público em `https://`, o build de produção falha de propósito e o log do build mostra o nome da variável.
3. Faça o deploy. A Vercel lê o `vercel.json` e agenda os lembretes diários (`/api/cron/lembretes`, 9h de Fortaleza), enviando o `CRON_SECRET` sozinha.

## 5. Webhook do WhatsApp

1. No app da Meta, no caso de uso do WhatsApp, em **Etapa 2. Configuração da produção → Configurar webhooks**:
   - URL de callback: `https://<seu-app>.vercel.app/api/whatsapp/webhook`
   - Verificar token: o mesmo `WHATSAPP_VERIFY_TOKEN`
2. Clique em **Verificar e salvar** e, na tabela **Campos do webhook**, assine só o campo **messages**. O botão **Teste** dessa linha deve aparecer nos **Request Logs** da Vercel como `POST /api/whatsapp/webhook` com status 200 (401 indica `META_APP_SECRET` errado).
3. **Publique o app** (ícone de publicar no menu da esquerda). Enquanto ele não está publicado, a Meta só envia os webhooks de teste do painel, e as mensagens reais de login nunca chegam (ADR 0044). Ela pede:
   - URL da política de privacidade: `https://<seu-app>.vercel.app/privacidade`;
   - categoria do app;
   - ícone de 1024×1024, gerado a partir do `public/logo.svg`.

## 6. Conferir

- `https://<seu-app>.vercel.app/dev/whatsapp` responde **404** (o simulador não existe em produção).
- Em `/prestador`, cadastre-se com um dos telefones do grupo: o WhatsApp abre com `ENTRAR XXXXX` para o número de teste, e o painel aparece depois de enviar.
- No celular, ative as notificações no painel e peça para outra pessoa tocar em "Conversar" no seu perfil.

## Avisos

- **Supabase gratuito pausa o projeto depois de 7 dias sem uso.** Para reativar, abra o painel do projeto e clique em "Restore".
- **Cron no plano Hobby da Vercel** roda uma vez por dia, em algum momento dentro da hora agendada.
- **Trocar o número de teste por um chip próprio** não muda o código: atualize `WHATSAPP_CABRABOM_NUMBER`, registre o número no WhatsApp da Meta e confira o webhook.
- **Migrações novas** vão para o banco sozinhas no merge, ao mesmo tempo que o deploy da Vercel. Escreva cada migração de forma que o código anterior continue funcionando com ela (ADR 0043).
- **Moderação:** veja a seção "Moderação" do README.
