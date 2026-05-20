import { ApiKeysManagementPanel } from "@/components/settings/api-keys-management-panel"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function ApiKeysSettingsPage() {
  return (
    <SettingsShell
      title="API keys"
      description="Create and manage keys for ingestion, automation, and integrations."
    >
      <ApiKeysManagementPanel />
    </SettingsShell>
  )
}
