This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Stripe

Para habilitar a assinatura mensal via Stripe configure as variáveis a seguir no `.env` (e no painel de produção):

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
APP_URL=https://seu-dominio.com
```

Durante o desenvolvimento utilize `stripe listen --forward-to localhost:3000/api/webhooks/stripe` para testar os webhooks. Os valores do carrinho são enviados dinamicamente para o Checkout do Stripe através de `price_data`.
