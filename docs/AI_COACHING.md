# AI coaching integration

The browser owns the deterministic forecast. Connected AI explains that
forecast and suggests next actions; it does not replace the safety formula or
make untraceable balance calculations.

## Configure the endpoint

Set `VITE_AI_COACHING_URL` to an HTTPS POST endpoint. If Supabase Auth has an
active session, the client includes its access token as a bearer token. The
endpoint should validate that token before responding.

The request contains aggregate financial signals only. Transaction names,
account names, notes, and individual activity records are not sent.

```json
{
  "forecast": {
    "month": "2026-09",
    "currentBalance": 12000,
    "projectedSavings": 6305,
    "safeToSpend": 3445,
    "remainingEssentials": 4695,
    "expectedIncome": 0,
    "uncertaintyHold": 360,
    "dailySpendRate": 115.86,
    "paceDifference": -56.7,
    "confidence": "high",
    "confidenceReasons": ["9 days with recorded activity"],
    "spendByCategory": { "Food": 1415, "Transport": 190 }
  },
  "goals": {
    "savingsTarget": 2500,
    "emergencyFloor": 1000
  }
}
```

Return a short summary and no more than three insights:

```json
{
  "summary": "Your essentials are covered and the current pace supports your target.",
  "insights": [
    {
      "id": "pace",
      "title": "Your pace is below plan",
      "body": "Keep cash entries current so the estimate stays reliable.",
      "action": "Review recent activity",
      "tone": "positive"
    }
  ]
}
```

Allowed tones are `positive`, `watch`, and `neutral`. Invalid responses and
network failures automatically fall back to the on-device coach.

## Server-side guardrails

- Keep the AI provider key in server-side secrets.
- Authenticate requests and apply per-user rate limits.
- Do not log request bodies or model prompts containing financial aggregates.
- Instruct the model to explain supplied calculations, not invent balances.
- Validate the response schema and cap the output length.
- Avoid claims of guaranteed outcomes or regulated financial advice.
