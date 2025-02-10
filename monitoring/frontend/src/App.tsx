import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectProvider } from "@/context/ProjectContext";

// Layouts
import Layout from "@/components/Layout";
import DashboardLayout from "@/components/layout/dashboard-layout";

// Pages
import Dashboard from "@/pages/dashboard";
import Logs from "@/pages/logs";
import Metrics from "@/pages/metrics";
import Traces from "@/pages/traces";
import Alerts from "@/pages/alerts";
import Infrastructure from "@/pages/infrastructure";
import Databases from "@/pages/databases";
import Services from "@/pages/services";
import Teams from "@/pages/TeamsPage";
import Settings from "@/pages/settings";
import LandingPage from "@/components/landing/LandingPage";
import Login from "@/components/auth/Login";
import Signup from "@/components/auth/Signup";
import AuthGuard from "@/components/auth/AuthGuard";
import DocsLayout from "@/components/docs/DocsLayout";
import Introduction from "@/components/docs/Introduction";
import QuickStart from "@/components/docs/QuickStart";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import DataSourcesHub from "@/components/datasources/DataSourcesHub";
import DockerIntegration from "@/components/datasources/DockerIntegration";
import KubernetesIntegration from "@/components/datasources/KubernetesIntegration";
import ProjectDashboard from "@/components/projects/ProjectDashboard";
import AIInsightsDashboard from "@/components/analytics/AIInsightsDashboard";
import AutomationRules from "@/components/automation/AutomationRules";
import DashboardBuilder from "@/components/dashboards/DashboardBuilder";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import MLAnalytics from "@/components/analytics/MLAnalytics";
import CollaborationHub from "@/components/collaboration/CollaborationHub";
import ReportBuilder from "@/components/reporting/ReportBuilder";
import APIManager from "@/components/api/APIManager";
import ResourceManager from "@/components/resources/ResourceManager";
import WorkflowBuilder from "@/components/automation/WorkflowBuilder";
import ServiceRegistry from "@/components/services/ServiceRegistry";
import ComplianceManager from "@/components/compliance/ComplianceManager";
import KnowledgeBase from "@/components/knowledge/KnowledgeBase";
import PerformanceAnalytics from "@/components/analytics/PerformanceAnalytics";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import AssetManager from "@/components/assets/AssetManager";
import ReportGenerator from "@/components/reports/ReportGenerator";
import AuditLog from "@/components/audit/AuditLog";
import SearchEngine from "@/components/search/SearchEngine";
import Security from "./components/Security";
import AIAnalytics from "./components/AIAnalytics";
import IntegrationHub from "./components/IntegrationHub";
import UserManagement from "./components/UserManagement";
import WebhooksManager from "./components/webhooks/WebhooksManager";
import S3Import from "./components/S3Import";
import LogImport from "./components/LogImport";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Documentation Routes */}
              <Route path="/docs" element={<DocsLayout />}>
                <Route index element={<Introduction />} />
                <Route path="quickstart" element={<QuickStart />} />
                <Route path="installation" element={<QuickStart />} />
                <Route path="python" element={<QuickStart />} />
                <Route path="javascript" element={<QuickStart />} />
                <Route path="go" element={<QuickStart />} />
                <Route path="java" element={<QuickStart />} />
                <Route path="log-management" element={<QuickStart />} />
                <Route path="metrics" element={<QuickStart />} />
                <Route path="alerts" element={<QuickStart />} />
                <Route path="dashboards" element={<QuickStart />} />
                <Route path="ai-analytics" element={<QuickStart />} />
                <Route path="custom-metrics" element={<QuickStart />} />
                <Route path="log-parsing" element={<QuickStart />} />
                <Route path="retention" element={<QuickStart />} />
                <Route path="authentication" element={<QuickStart />} />
                <Route path="access-control" element={<QuickStart />} />
                <Route path="api-keys" element={<QuickStart />} />
                <Route path="compliance" element={<QuickStart />} />
                <Route path="aws" element={<QuickStart />} />
                <Route path="gcp" element={<QuickStart />} />
                <Route path="kubernetes" element={<QuickStart />} />
                <Route path="docker" element={<QuickStart />} />
                <Route path="api" element={<QuickStart />} />
                <Route path="graphql" element={<QuickStart />} />
                <Route path="webhooks" element={<QuickStart />} />
                <Route path="rate-limits" element={<QuickStart />} />
                <Route path="faq" element={<QuickStart />} />
                <Route path="troubleshooting" element={<QuickStart />} />
                <Route path="best-practices" element={<QuickStart />} />
                <Route path="community" element={<QuickStart />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/explorer" element={
                <AuthGuard>
                  <Layout>
                    <Logs />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/teams" element={
                <AuthGuard>
                  <Layout>
                    <Teams />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/alerts" element={
                <AuthGuard>
                  <Layout>
                    <Alerts />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/reports" element={
                <AuthGuard>
                  <Layout>
                    <ReportBuilder />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/report-generator" element={
                <AuthGuard>
                  <Layout>
                    <ReportGenerator />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/metrics" element={
                <AuthGuard>
                  <Layout>
                    <Metrics />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/s3-import" element={
                <AuthGuard>
                  <Layout>
                    <S3Import />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/log-import" element={
                <AuthGuard>
                  <Layout>
                    <LogImport />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/security" element={
                <AuthGuard>
                  <Layout>
                    <Security />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/ai-analytics" element={
                <AuthGuard>
                  <Layout>
                    <AIAnalytics />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/integrations" element={
                <AuthGuard>
                  <Layout>
                    <IntegrationHub />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/users" element={
                <AuthGuard>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <Layout>
                    <Settings />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/webhooks" element={
                <AuthGuard>
                  <Layout>
                    <WebhooksManager />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/analytics" element={
                <AuthGuard>
                  <Layout>
                    <AnalyticsDashboard />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/datasources" element={
                <AuthGuard>
                  <Layout>
                    <DataSourcesHub />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/datasources/docker" element={
                <AuthGuard>
                  <Layout>
                    <DockerIntegration />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/datasources/kubernetes" element={
                <AuthGuard>
                  <Layout>
                    <KubernetesIntegration />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/projects" element={
                <AuthGuard>
                  <Layout>
                    <ProjectDashboard />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/ai-insights" element={
                <AuthGuard>
                  <Layout>
                    <AIInsightsDashboard />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/automation" element={
                <AuthGuard>
                  <Layout>
                    <AutomationRules />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/dashboard-builder" element={
                <AuthGuard>
                  <Layout>
                    <DashboardBuilder />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/security-dashboard" element={
                <AuthGuard>
                  <Layout>
                    <SecurityDashboard />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/ml-analytics" element={
                <AuthGuard>
                  <Layout>
                    <MLAnalytics />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/collaboration" element={
                <AuthGuard>
                  <Layout>
                    <CollaborationHub />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/api-manager" element={
                <AuthGuard>
                  <Layout>
                    <APIManager />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/resources" element={
                <AuthGuard>
                  <Layout>
                    <ResourceManager />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/workflows" element={
                <AuthGuard>
                  <Layout>
                    <WorkflowBuilder />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/services" element={
                <AuthGuard>
                  <Layout>
                    <ServiceRegistry />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/compliance" element={
                <AuthGuard>
                  <Layout>
                    <ComplianceManager />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/knowledge" element={
                <AuthGuard>
                  <Layout>
                    <KnowledgeBase />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/performance" element={
                <AuthGuard>
                  <Layout>
                    <PerformanceAnalytics />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/notifications" element={
                <AuthGuard>
                  <Layout>
                    <NotificationCenter />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/assets" element={
                <AuthGuard>
                  <Layout>
                    <AssetManager />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/audit" element={
                <AuthGuard>
                  <Layout>
                    <AuditLog />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/search" element={
                <AuthGuard>
                  <Layout>
                    <SearchEngine />
                  </Layout>
                </AuthGuard>
              } />

              <Route path="/app" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="logs" element={<Logs />} />
                <Route path="metrics" element={<Metrics />} />
                <Route path="traces" element={<Traces />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="infrastructure" element={<Infrastructure />} />
                <Route path="databases" element={<Databases />} />
                <Route path="services" element={<Services />} />
                <Route path="teams" element={<Teams />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
