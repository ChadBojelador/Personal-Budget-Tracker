# Implementation roadmap

## Phase 1 — Foundation

- Establish the visual system and responsive application shell.
- Implement the dashboard with representative local demo data.
- Define domain types and deterministic money calculations.
- Add test coverage for emergency-floor and affordability rules.
- Add PWA metadata and offline application shell.

## Phase 2 — Secure accounts

- Create the Supabase project and schema migrations.
- Add email authentication.
- Add row-level security and cross-user isolation tests.
- Implement vault creation, unlock, recovery, and encrypted synchronization.
- Build onboarding for starting balances and allowance checkpoints.

## Phase 3 — Daily money tracking

- Implement cash income, expense, transfer, edit, and reconciliation flows.
- Add account balances and a daily 9:00 PM check-in.
- Add categories and review queues.
- Add encrypted export and restore.

## Phase 4 — Imports

- Add a generic preview-and-confirm import pipeline.
- Add GCash history parsing against user-supplied sample exports.
- Add MariBank parsing after confirming its available export format.
- Add duplicate detection, transfer matching, and freshness states.

## Phase 5 — Insights

- Implement the first-month learning state.
- Add essential-spend baselines and recurring-cost suggestions.
- Add month-end forecast, target recommendation, and confidence explanations.
- Add wishlist and earliest-safe-date simulation.

## Phase 6 — Notifications and hardening

- Add discreet Chrome push subscriptions.
- Schedule the daily reminder, weekly summary, spending-pace warning,
  allowance-due warning, target warning, and wishlist-ready event.
- Complete accessibility, security, import-fuzzing, and recovery tests.
- Run a full month-long personal beta before enabling public registration.

## Key delivery gates

1. No cloud connection until row-level security tests pass.
2. No real financial data until vault backup and restore pass.
3. No import adapter accepted without duplicate and malformed-file tests.
4. No forecast labelled confident before the minimum data threshold.
5. No public accounts until the personal beta exposes acceptable workflows.

