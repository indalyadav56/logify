export type WorkspaceSummary = {
  id: string
  name: string
  role: string
  initials: string
}

export const DEFAULT_WORKSPACES: WorkspaceSummary[] = [
  { id: "prod", name: "Logify Production", role: "Admin", initials: "LP" },
  { id: "stage", name: "Logify Staging", role: "Editor", initials: "LS" },
  { id: "sand", name: "Acme Sandbox", role: "Viewer", initials: "AS" },
]
