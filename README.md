# Budget Tracker

A privacy-first personal budget tracker for cash, GCash, and MariBank. The app
learns essential spending during its first month, forecasts savings, and tells
the user when a discretionary purchase is genuinely affordable.

## Product status

The repository is at the start of implementation. Product decisions from the
discovery interview are recorded in [`docs/PRODUCT.md`](docs/PRODUCT.md).

## Planned stack

- React + TypeScript + Vite
- Supabase Auth and Postgres
- End-to-end encryption for sensitive financial fields
- Installable PWA with discreet Chrome notifications
- Local parsing for imported statements

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when a Supabase project is available. The
initial UI works with demo data if Supabase is not configured.

## Documentation

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product requirements and core rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system and data design
- [`docs/SECURITY.md`](docs/SECURITY.md) — threat model and security controls
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased implementation plan
- [`docs/DESIGN.md`](docs/DESIGN.md) — visual system and interaction direction

