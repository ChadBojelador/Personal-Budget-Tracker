# Security model

## Protected assets

- Balances, transactions, categories, income, targets, and wishlist items.
- The vault data-encryption key and recovery key.
- Supabase sessions and push subscriptions.
- Imported account-history files.

## Main threats

- A database leak exposing financial behavior.
- A broken access policy exposing one user's rows to another.
- Frontend code leaking a privileged Supabase key.
- Cross-site scripting reading an unlocked vault.
- Original statements being uploaded or retained accidentally.
- A stolen or shared unlocked laptop exposing the live session.
- Loss of both the vault password and recovery key.

## Required controls

- Enable and test row-level security on every exposed table.
- Permit rows only when `auth.uid()` is present and equals `user_id`.
- Never ship a Supabase service-role key to the browser.
- Encrypt sensitive payloads before network transmission.
- Use unique authenticated-encryption nonces and version every envelope.
- Apply a restrictive Content Security Policy and avoid unsafe HTML rendering.
- Clear decrypted state when the app locks, signs out, or becomes idle.
- Parse imported statements locally and discard their buffers after preview.
- Keep financial details out of URLs, analytics, logs, errors, and notifications.
- Require re-unlock before exports or security-setting changes.
- Provide an encrypted export and test restore as part of release verification.

## Authentication and vault recovery

Supabase Auth proves account ownership; the vault password decrypts financial
data. They are deliberately separate. Account recovery alone cannot decrypt the
vault. During onboarding the user receives a one-time recovery key and must
confirm that it has been saved before proceeding.

The product must state clearly that losing both the vault password and recovery
key makes the data unrecoverable.

## Privacy rules

- Do not request or store GCash or MariBank passwords, PINs, or OTPs.
- Do not scrape or automate either banking app.
- Do not upload original statements.
- Push notifications contain only generic event wording.
- Analytics are disabled by default and may never contain financial payloads.
- Account deletion removes server records and invalidates push subscriptions.

## Security verification before launch

- Automated policy tests using two distinct users.
- Attempt unauthenticated reads and writes against every table.
- Search production bundles for secret/service-role keys.
- Test malicious statement text and spreadsheet-formula payloads.
- Test vault lock on timeout, refresh, sign-out, and multi-tab activity.
- Review dependency and Content Security Policy reports.
- Restore an encrypted backup in a fresh browser profile.

