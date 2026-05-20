import { UsersManagementPanel } from "@/components/settings/users-management-panel"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function UsersSettingsPage() {
  return (
    <SettingsShell
      title="Users"
      description="Invite members, assign roles, and manage access to your organization."
    >
      <UsersManagementPanel />
    </SettingsShell>
  )
}
