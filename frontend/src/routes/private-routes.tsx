import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LogsPage = lazy(() => import("@/pages/explorer/Logs"));
// const ProjectsPage = lazy(() => import("@/pages/projects"));
// const ProjectDetailsPage = lazy(() => import("@/pages/projects/[id]"));
// const NotificationsPage = lazy(() => import("@/pages/notifications"));
// const WebhooksPage = lazy(() => import("@/pages/webhooks"));
// const TeamsPage = lazy(() => import("@/pages/teams"));
// const AuditPage = lazy(() => import("@/pages/audit"));
// const SettingsPage = lazy(() => import("@/pages/settings"));
// const ImportPage = lazy(() => import("@/pages/import"));
// const ExportPage = lazy(() => import("@/pages/export"));
// const BookmarksPage = lazy(() => import("@/pages/bookmarks"));
// const AlertsPage = lazy(() => import("@/pages/alerts"));
// const BillingPage = lazy(() => import("@/pages/billing"));
// const DocsPage = lazy(() => import("@/pages/docs"));

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
  // <Route
  //   key="import"
  //   path="/import"
  //   element={
  //     <ProtectedRoute>
  //       <ImportPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="export"
  //   path="/export"
  //   element={
  //     <ProtectedRoute>
  //       <ExportPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="projects"
  //   path="/projects"
  //   element={
  //     <ProtectedRoute>
  //       <ProjectsPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="projects-details"
  //   path="/projects/:id"
  //   element={
  //     <ProtectedRoute>
  //       <ProjectDetailsPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="notifications"
  //   path="/notifications"
  //   element={
  //     <ProtectedRoute>
  //       <NotificationsPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="webhooks"
  //   path="/webhooks"
  //   element={
  //     <ProtectedRoute>
  //       <WebhooksPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="teams"
  //   path="/teams"
  //   element={
  //     <ProtectedRoute>
  //       <TeamsPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="audit"
  //   path="/audit"
  //   element={
  //     <ProtectedRoute>
  //       <AuditPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="settings"
  //   path="/settings"
  //   element={
  //     <ProtectedRoute>
  //       <SettingsPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="bookmarks"
  //   path="/bookmarks"
  //   element={
  //     <ProtectedRoute>
  //       <BookmarksPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="alerts"
  //   path="/alerts"
  //   element={
  //     <ProtectedRoute>
  //       <AlertsPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="billing"
  //   path="/billing"
  //   element={
  //     <ProtectedRoute>
  //       <BillingPage />
  //     </ProtectedRoute>
  //   }
  // />,
  // <Route
  //   key="docs"
  //   path="/docs"
  //   element={
  //     <ProtectedRoute>
  //       <DocsPage />
  //     </ProtectedRoute>
  //   }
  // />,
];
