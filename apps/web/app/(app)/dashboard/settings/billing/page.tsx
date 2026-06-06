import { BillingPanel } from "@/components/settings/billing-panel"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function BillingPage() {
  return (
    <SettingsShell
      title="Billing & Subscription"
      description="Manage your plan, usage, payment method, and invoice history."
    >
      <BillingPanel />
    </SettingsShell>
  )
}
