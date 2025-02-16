import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { Toaster } from "sonner";

// Lazy loaded components
const LogPage = lazy(() => import("@/pages/explorer/Logs"));
const ExamplePage = lazy(() => import("@/pages/example"));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <SidebarProvider defaultOpen>
            {/* Sidebar */}
            <AppSidebar className="border-r" />
            {/* Main Content */}
            <SidebarInset className="h-full">
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  <Route path="/" element={<LogPage />} />
                  <Route path="/example" element={<ExamplePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </SidebarInset>
        </SidebarProvider>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;