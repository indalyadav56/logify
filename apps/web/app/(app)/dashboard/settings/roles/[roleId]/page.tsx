import { RoleDetailPanel } from "@/components/settings/role-detail-panel"
import { SettingsShell } from "@/components/settings/settings-shell"
import { getRoleById } from "@/lib/settings/mock-data"
import { getRoleStaticParams } from "@/lib/settings/static-params"

type PageProps = {
  params: Promise<{ roleId: string }>
}

export function generateStaticParams() {
  return getRoleStaticParams()
}

export default async function RoleDetailPage({ params }: PageProps) {
  const { roleId } = await params
  const role = getRoleById(roleId)

  return (
    <SettingsShell
      title={role?.name ?? "Role"}
      description={
        role
          ? "Review and edit permissions for this role."
          : "The requested role could not be found."
      }
    >
      <RoleDetailPanel roleId={roleId} />
    </SettingsShell>
  )
}
