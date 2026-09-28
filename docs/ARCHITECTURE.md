# Architecture

## Overview

```text
Chrome PWA
  |-- React interface
  |-- local statement parsers
  |-- forecast and affordability engine
  |-- Web Crypto vault
  |
  | HTTPS: ciphertext + non-sensitive metadata only
  v
Supabase
  |-- Auth
  |-- Postgres with row-level security
  |-- Edge Functions for generic push scheduling
  `-- encrypted backup records
```

The financial engine runs in the unlocked browser. This keeps sensitive values
out of server logs and allows a generic notification service to operate without
knowing balances or purchase names.

## Frontend

- React and TypeScript, built with Vite.
- PWA manifest and service worker for installation, offline shell, and push.
- Accessible responsive layout, optimized first for a Windows laptop.
- IndexedDB cache stores only ciphertext plus short-lived in-memory decrypted
  state while the vault is unlocked.
- Import adapters normalize each supported statement format into a common
  transaction draft.

## Encryption model

1. Generate a random data-encryption key (DEK) in the browser.
2. Derive a key-encryption key from the vault password using an audited
   memory-hard password KDF.
3. Wrap the DEK with that key and separately with a random recovery key.
4. Encrypt sensitive record payloads with authenticated encryption and a fresh
   nonce per write.
5. Keep the unwrapped DEK only in memory while the vault is unlocked.

Changing the login password does not affect the vault. Changing the vault
password re-wraps the DEK without re-encrypting every transaction.

## Data boundaries

The server may know:

- opaque user and record identifiers;
- record type and timestamps required for synchronization;
- import fingerprints used for duplicate detection;
- notification schedule and push subscription; and
- ciphertext version.

The encrypted payload contains:

- account names and balances;
- transaction amounts, descriptions, categories, and notes;
- income amounts and schedules;
- savings targets and forecasts; and
- wishlist names, prices, dates, and priorities.

## Initial tables

Every user-owned table includes `user_id`, timestamps, and row-level security.

- `profiles`: timezone, onboarding state, and safe preferences.
- `vaults`: wrapped DEK, recovery-wrapped DEK, salt, and crypto version.
- `accounts`: encrypted account payload and account type.
- `transactions`: encrypted payload, date bucket, and import fingerprint.
- `expected_income`: encrypted schedule and actual-receipt link.
- `budget_settings`: encrypted emergency floor and target configuration.
- `wishlist_items`: encrypted item payload and status.
- `import_batches`: source type, file fingerprint, and counts; never file data.
- `notification_preferences`: generic event toggles and local schedule.
- `push_subscriptions`: browser endpoint and encrypted subscription keys.

## Forecast engine

Version one is deterministic and explainable rather than branded as AI.

- Use the first complete month as the minimum baseline.
- Estimate food and transport with recency-weighted daily spending.
- Learn weekday and weekend rates separately when sample size allows.
- Detect recurring Wi-Fi and mobile-load activity by category, amount range, and
  interval; ask the user to confirm suggestions.
- Include guaranteed expected allowance in projected future cash flow.
- Exclude account transfers from income and expense totals.
- Reduce confidence for missing days, uncategorized activity, or stale digital
  accounts.

The engine returns values plus an explanation object so the interface can show
why a forecast changed.

## Safe-to-spend formula

```text
safe today = current reconciled funds
           - remaining essential reserve
           - emergency floor
           - remaining savings target
           - uncertainty hold
```

Future affordability simulates daily essential spending and guaranteed income
through each date. It must never silently count an expected deposit as current
cash.

## Multi-user readiness

The app is single-person in interaction design, not in schema design. No global
financial rows exist. All reads and writes are scoped by the authenticated user
in both application queries and Postgres policies. Admin tooling must never
decrypt customer data.

