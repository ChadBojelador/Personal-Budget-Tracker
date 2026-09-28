# Budget Tracker

A privacy-first personal budget tracker for cash, e-wallets, and bank accounts.
It calculates an explainable month-end forecast, protects essential spending,
and coaches the user toward a safe savings outcome.

## What works

- Add income and expenses and see account balances and forecasts update.
- Add, update, and remove accounts.
- Complete a daily cash check-in.
- Review current-month activity and protected essential budgets.
- Calculate safe-to-spend and the earliest safe date for a wishlist item.
- Inspect every forecast assumption and confidence signal.
- Get on-device coaching, with optional connected AI coaching.
- Change emergency, savings, and allowance guardrails.
- Switch between light and dark themes.
- Persist demo/local data in the browser.
- Initialize Supabase only when both public environment values are present.

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

The app works without environment values using local demo data and the
deterministic on-device coach.

## Environment

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_AI_COACHING_URL=https://your-private-api.example.com/coach
VITE_DEMO_MODE=true
```

Only a Supabase publishable/anonymous key belongs in the browser. Never put a
service-role key or an AI provider secret in a `VITE_` variable. The coaching
URL should point to a server or Supabase Edge Function that keeps its provider
credentials server-side. See [`docs/AI_COACHING.md`](docs/AI_COACHING.md) for
the request and response contract.

## Verification

```bash
npm test
npm run lint
npm run build
```

The forecast tests cover protected reserves, current-vs-future income,
affordability dates, and explainable coaching output.

## Architecture notes

Local storage is used for the working demo. Supabase client initialization is
ready, but plaintext financial records are intentionally not synced. Cloud sync
should only be enabled after the vault encryption and row-level-security gates
in [`docs/SECURITY.md`](docs/SECURITY.md) are complete.

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product requirements and core rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system and data design
- [`docs/SECURITY.md`](docs/SECURITY.md) — threat model and security controls
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased implementation plan
- [`docs/DESIGN.md`](docs/DESIGN.md) — visual system and interaction direction
