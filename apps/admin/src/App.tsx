import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { OverviewPage } from "@/pages/overview-page"
import { UsersPage } from "@/pages/users-page"
import { OrganizationsPage } from "@/pages/organizations-page"
import { OrganizationDetailPage } from "@/pages/organization-detail-page"
import { ProjectsPage } from "@/pages/projects-page"
import { BillingPage } from "@/pages/billing-page"
import { SystemPage } from "@/pages/system-page"
import { AuditLogsPage } from "@/pages/audit-logs-page"
import { SettingsPage } from "@/pages/settings-page"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="organizations/:id" element={<OrganizationDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
