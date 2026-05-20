import { GeneralSettingsPanel } from "@/components/settings/general-settings-panel"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function GeneralSettingsPage() {
  return (
    <SettingsShell
      title="General"
      description="Organization identity, security policies, and notification defaults."
    >
      <GeneralSettingsPanel />
    </SettingsShell>
  )
}
