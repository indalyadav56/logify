import { MOCK_ROLES } from "./mock-data"

/** IDs pre-rendered at build time when `output: "export"` is enabled. */
export function getRoleStaticParams() {
  return MOCK_ROLES.map((role) => ({
    roleId: role.id,
  }))
}
