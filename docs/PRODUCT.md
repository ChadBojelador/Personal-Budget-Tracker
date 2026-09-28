# Product requirements

## Purpose

Help a person understand where their mixed cash and digital money is going,
how much they are likely to save, and whether a non-essential purchase is safe
without endangering essentials or savings.

The first experience is optimized for one person. Ownership is present in the
data model from day one so private accounts can be offered to other people
later.

## Confirmed decisions

- Primary budget period: calendar month.
- Income: a guaranteed allowance expected twice monthly, sometimes early and
  sometimes deposited into different accounts. Other income is also supported.
- Accounts at launch: physical cash, GCash, and MariBank.
- Cash activity: entered manually during a daily check-in.
- Digital activity: imported weekly from account transaction-history files.
- Starting point: no historic import; the user enters current balances and the
  newly received allowance during onboarding.
- Learning period: the first month observes spending and does not pretend to
  have high-confidence advice.
- Protected essentials: Wi-Fi, food, transport, and mobile load.
- Emergency floor: PHP 1,000 is never treated as spendable.
- Savings: show both projected savings and progress against an accepted target.
  Recommend the first target after the learning month.
- Wishlist: item or activity, estimated price, desired date, and priority.
- Notifications are discreet and never include financial amounts or account
  names.
- Display: installable website optimized for Chrome on Windows in the
  Asia/Manila timezone.
- Visual direction: quiet Apple-inspired glassmorphism with strong readability.

## Primary jobs

1. Know how much money exists across cash and digital accounts.
2. Record cash activity in less than a minute each evening.
3. Import digital activity with duplicate detection once a week.
4. See a credible month-end savings forecast and its confidence.
5. Ask whether a want is affordable now and, if not, when it will be.

## Core experiences

### Onboarding

1. Create an account and verify the email address.
2. Create and confirm a separate vault password.
3. Save or print the one-time recovery key.
4. Add starting balances for cash, GCash, and MariBank.
5. Record the latest allowance and its destination account.
6. Set the two approximate allowance checkpoints.
7. Allow notifications and optionally install the PWA.

### Daily check-in

The 9:00 PM reminder opens a focused flow to:

- record today's cash income and spending;
- confirm physical cash on hand;
- review uncategorized imported activity; and
- mark an expected allowance as received and choose its destination.

### Weekly import

- Process files in the browser; do not upload or retain the originals.
- Preview detected transactions before saving.
- Detect duplicates using account, timestamp, amount, normalized description,
  and source reference where available.
- Detect transfers between owned accounts and exclude them from income and
  spending totals.
- Show a last-updated time on every digital balance.
- Mark forecasts stale after seven days without an import.

### Monthly learning and forecasting

Month one builds baselines for food and transport, detects repeating Wi-Fi and
mobile-load costs, and separates weekday from weekend behavior. Advice remains
labelled low confidence.

After the first complete month, the app proposes a savings target. The user can
accept or edit it. Predictions update after every transaction.

### Affordability check

The safe-to-spend calculation must protect, in order:

1. remaining essential costs until month end;
2. the PHP 1,000 emergency floor;
3. the accepted savings target;
4. a hold for uncategorized or stale account data.

The result shows:

- affordable now: yes or no;
- maximum safe spending today;
- earliest projected safe date;
- effect on month-end savings;
- the reason a purchase is unsafe; and
- forecast confidence and data freshness.

Expected allowance may appear in future projections because it is guaranteed,
but it is never included in the current account balance before receipt.

## Notifications

Enabled by default:

- projected month-end savings falls below the accepted target;
- expected allowance is due but has not been recorded;
- weekly balance, spending, and forecast summary;
- a wishlist item becomes affordable;
- spending is unusually fast relative to the learned pace; and
- daily tracker update at 9:00 PM.

Notification bodies are generic. Details appear only after opening and
unlocking the vault. A sleeping or offline laptop receives notifications after
it wakes and reconnects.

## Out of scope for the first release

- Direct GCash or MariBank credentials or screen scraping.
- Initiating payments or moving money.
- Paid open-finance integrations.
- Credit, loans, investments, or shared household budgets.
- Claims that a forecast is guaranteed financial advice.

## Success criteria

- Daily cash entry can be completed in under 60 seconds.
- A repeated statement import does not create duplicate transactions.
- No user can read another user's rows, even with direct API calls.
- Supabase receives no plaintext balance, amount, description, wishlist name,
  or original financial statement.
- Every forecast explains its assumptions, freshness, and confidence.

