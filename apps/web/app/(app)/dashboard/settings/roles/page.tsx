import { RolesManagementPanel } from "@/components/settings/roles-management-panel"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function RolesSettingsPage() {
  return (
    <SettingsShell
      title="Roles & permissions"
      description="Control what each role can access across Logify resources."
    >
      <RolesManagementPanel />
    </SettingsShell>
  )
}
