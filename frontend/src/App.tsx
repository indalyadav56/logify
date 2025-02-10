import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "@/context/ProjectContext";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import LogExplorer from "@/components/explorer/LogExplorer";
import LogExplorerOld from "@/components/LogExplorer";
import Alerts from "@/components/Alerts";
import Settings from "@/components/Settings";
import Reports from "@/components/Reports";
import Metrics from "@/components/Metrics";
import Security from "@/components/Security";
import AIAnalytics from "@/components/AIAnalytics";
import IntegrationHub from "@/components/integrations/IntegrationHub";
import UserManagement from "@/components/UserManagement";
import S3Import from "@/components/S3Import";
import LogImport from "@/components/LogImport";
import WebhooksManager from "@/components/webhooks/WebhooksManager";
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
import TeamsPage from "./pages/TeamsPage";
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
import OverView from "./pages/OverView";

function App() {
  return (
    <ProjectProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {/* <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> */}
        <BrowserRouter>
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
            <Route path="/overview" element={
              <AuthGuard>
                <Layout>
                  <OverView />
                </Layout>
              </AuthGuard>
            } />
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
                  <LogExplorer />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/log-explorer" element={
              <AuthGuard>
                <Layout>
                  <LogExplorerOld />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/teams" element={
              <AuthGuard>
                <Layout>
                  <TeamsPage />
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
                  <Reports />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/report-builder" element={
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

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ProjectProvider>
  );
}

export default App;
