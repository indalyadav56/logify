import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
// import { Layout } from "@/components/layout";
import { lazy } from "react";

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LogsPage = lazy(() => import("@/pages/explorer/Logs"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const WebhooksPage = lazy(() => import("@/pages/webhooks"));
const TeamsPage = lazy(() => import("@/pages/teams"));
const AuditPage = lazy(() => import("@/pages/audit"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const ImportPage = lazy(() => import("@/pages/import"));
const ExportPage = lazy(() => import("@/pages/export"));

export const privateRoutes = [
  <Route
    key="dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
          <DashboardPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="logs"
    path="/logs"
    element={
      <ProtectedRoute>
          <LogsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="import"
    path="/import"
    element={
      <ProtectedRoute>
          <ImportPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="export"
    path="/export"
    element={
      <ProtectedRoute>
          <ExportPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="projects"
    path="/projects"
    element={
      <ProtectedRoute>
          <ProjectsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="notifications"
    path="/notifications"
    element={
      <ProtectedRoute>
          <NotificationsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="webhooks"
    path="/webhooks"
    element={
      <ProtectedRoute>
          <WebhooksPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="teams"
    path="/teams"
    element={
      <ProtectedRoute>
          <TeamsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="audit"
    path="/audit"
    element={
      <ProtectedRoute>
          <AuditPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="/settings"
    element={
      <ProtectedRoute>
          <SettingsPage />
      </ProtectedRoute>
    }
  />,
];
