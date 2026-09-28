# AI and prediction strategy

## Current state

No external AI model is connected. The planned prediction engine is local,
deterministic, and explainable. It learns spending pace with statistical rules,
projects guaranteed income, protects essential reserves and the emergency
floor, and simulates the safe date for a wishlist item.

This is intentional: a language model should not be the authority that decides
whether money is safe to spend.

## What AI may add later

An optional assistant can sit above the calculation engine to:

- explain why the forecast changed in natural language;
- suggest a category for an unfamiliar transaction description;
- summarize weekly patterns without exposing notification details; and
- answer questions using values already calculated by the trusted engine.

The assistant must never invent balances, modify transactions without
confirmation, initiate payments, or replace the affordability formula.

## Privacy boundary

The financial vault is end-to-end encrypted. A server-side AI cannot read it by
default. Any future AI feature must use one of these explicit modes:

1. On-device model: strongest privacy, but a larger download and higher laptop
   resource use.
2. Opt-in cloud explanation: the browser sends a minimal, temporary aggregate
   such as category totals and forecast reasons after clear consent. It never
   sends account credentials, raw statements, full descriptions, or persistent
   decrypted records.

Cloud AI is disabled by default. Provider keys must stay in a server-side
secret store and must never be placed in the browser bundle.

## Recommended sequence

1. Build and test the deterministic forecast engine.
2. Complete the personal month-long learning period.
3. Evaluate whether explanations are unclear without AI.
4. Prototype an on-device or explicitly opt-in explanation assistant.
5. Compare every AI statement with the engine output and reject unsupported
   claims before display.
