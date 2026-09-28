# Design direction

## Concept

The interface is a calm, private window onto the month. Its signature element
is a continuous spending runway that connects today's available money, the next
allowance checkpoint, protected expenses, and projected month end. Glass is
used to establish depth and focus, not as decoration on every box.

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
+ sidebar --+------------------------------------------------+
| Month     |  greeting                         vault status |
| Activity  |                                                |
| Wishlist  |  [ continuous spending runway and forecast ]  |
| Insights  |                                                |
| Settings  |  account strip                                |
|           |                                                |
| check-in  |  protected essentials   next useful actions   |
+-----------+------------------------------------------------+
```

The layout is left-aligned and spacious. The runway receives the visual energy;
supporting modules are quieter and not forced into identical cards.

## Glass rules

- Use translucent surfaces only where layering communicates context.
- Maintain an opaque-enough fallback for contrast and reduced transparency.
- Use subtle inner highlights and a cool shadow; avoid neon gradients.
- Vary radius by hierarchy: large forecast plane, medium controls, compact
  status chips.
- Motion is reserved for revealing a changed forecast or confirming a logged
  transaction and is disabled under reduced-motion preferences.

## Review against the brief

The initial direction risked becoming a generic collection of frosted cards.
It was revised around the spending runway: a financial timeline specific to
twice-monthly allowance, protected essentials, and a month-end destination.
Glass now supports that layered timeline instead of defining every component.
