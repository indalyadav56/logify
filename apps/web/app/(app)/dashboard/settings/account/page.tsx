import { AccountSettingsPanel } from "@/components/settings/account-settings-panel"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function AccountSettingsPage() {
  return (
    <SettingsShell
      title="Account"
      description="Your profile, timezone, and security preferences."
    >
      <AccountSettingsPanel />
    </SettingsShell>
  )
}
