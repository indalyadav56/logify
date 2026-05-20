const RESPONSES: { match: RegExp; reply: string }[] = [
  {
    match: /error|5xx|spike|checkout/i,
    reply: `**Checkout error spike (last 2h)**

Error rate on \`checkout-api\` rose from **0.08%** to **1.44%** starting ~12:38 UTC, aligned with deploy \`ab12c4f\`.

**Likely cause:** Timeouts on \`stripe.charge.create\` in the payments-worker pool (4 replicas; queue depth elevated).

**Suggested next steps:**
1. Open [Logs](/dashboard/logs) with \`level:error service:"checkout-api"\`
2. Compare trace waterfall for failing checkout spans
3. Consider rollback or scale payments-worker to 12 replicas

*Confidence: high · Grounded in mock telemetry*`,
  },
  {
    match: /query|logs|filter/i,
    reply: `Here's a Logify query you can run:

\`\`\`
level:error OR level:fatal
service:"checkout-api"
timestamp >= now()-2h
\`\`\`

Add \`body contains "timeout"\` to narrow to payment timeouts. Open the [Logs explorer](/dashboard/logs) and paste this into the query bar.`,
  },
  {
    match: /dashboard|widget|tile/i,
    reply: `For a payments SLO board I'd add:

1. **Metric** — 5xx error rate with 2% threshold line  
2. **Log volume** — stacked by level, filtered to \`payments-api\`  
3. **Log table** — recent errors, limit 15 rows  
4. **Note** — runbook link for rollback

You can add these from [Dashboards](/dashboard/dashboards) → Edit → Widget.`,
  },
  {
    match: /alert/i,
    reply: `**Draft alert rule**

- **Signal:** 5xx rate on \`checkout-api\`  
- **Condition:** > 2% for 10 minutes (rolling)  
- **Severity:** High  
- **Notify:** #incidents-oncall  

I can refine thresholds once you connect the alerting backend.`,
  },
]

export function generateAssistReply(userMessage: string): string {
  const trimmed = userMessage.trim()
  if (!trimmed) {
    return "Ask a question about your logs, dashboards, or alerts — or type `/` to see commands."
  }

  for (const { match, reply } of RESPONSES) {
    if (match.test(trimmed)) return reply
  }

  return `I analyzed your question in the context of **Logify Production**.

For **"${trimmed.slice(0, 80)}${trimmed.length > 80 ? "…" : ""}"**, I don't have a live model connected yet — this is a preview response. When the AI backend is wired, I'll correlate logs, metrics, and recent deploys automatically.

**Try asking:**
- Why did errors spike on checkout-api?
- Build a query for payment timeouts
- Suggest dashboard widgets for SLO tracking`
}
