# Design direction

## Concept

The interface is a calm daily budget check-in. Its signature element is one
plain-language safe-to-spend card that answers the user's first question before
showing any supporting detail. A contextual suggestion card sits beside it and
turns the forecast into a small set of useful next steps.

## Tokens

Dark mode is the default. Light mode remains available from the dashboard and
the preference is remembered on the device.

### Night ledger

- `night`: `#07101C` — default page background.
- `deep glass`: `rgba(13, 26, 42, 0.70)` — layered working surfaces.
- `moon ink`: `#EDF3FB` — primary text.
- `mist`: `#94A2B5` — secondary text.
- `water`: `#2F7CF6` — actions and current position.
- `mint`: `#36B995` — healthy savings and safe outcomes.

### Daylight

- `cloud`: `#F3F7FC` — cool daylight background.
- `ink`: `#122033` — primary text with a soft navy cast.
- `slate`: `#637083` — secondary text.
- `water`: `#2F7CF6` — actions and current position.
- `mint`: `#36B995` — healthy savings and safe outcomes.
- `coral`: `#EB786F` — risk and attention, never used decoratively.

Typography uses the native UI family so Chrome on Windows feels immediate and
crisp: Segoe UI, with the Apple system family as the natural macOS fallback.
Large figures use tabular numerals and restrained weight rather than oversized
marketing typography.

## Layout

```text
+-------------------------------------------------------------+
| Budget                              settings   add transaction|
+-------------------------------------------------------------+
| heading                                      month           |
|                                                             |
| [ safe to spend / key numbers ] [ what to do next ]         |
|                                                             |
| [ add transaction ] [ daily check-in ] [ check a purchase ] |
|                                                             |
| [ accounts ]             [ recent activity ]                |
| [ monthly plan                                        ]     |
+-------------------------------------------------------------+
```

The layout is left-aligned and spacious. The safe-to-spend card receives the
visual energy. Action cards use consistent placement because they are peers;
supporting account, activity, and budget cards are quieter and list-based.

## Card rules

- Use one dark blue card for the primary financial answer.
- Use light borders and little or no shadow for supporting cards.
- Vary radius and corner treatment by hierarchy instead of applying one tile
  style everywhere.
- Keep suggestions to three and pair each one with a direct action.
- Preserve an opaque fallback for reduced transparency and disable motion when
  the user requests reduced motion.

## Review against the brief

The earlier dashboard exposed the full model at once: a timeline, coaching,
accounts, essentials, activity, and wishlist all competed for attention. The
revision removes the sidebar and timeline from the primary workflow, leads with
safe-to-spend, and uses contextual suggestions plus three obvious actions.
Cards remain because the brief requested them, but hierarchy, corner treatment,
and content density vary so the result does not read as an identical tile grid.
