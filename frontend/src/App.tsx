import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loading from "./components/Loading";
import { TooltipProvider } from "./components/ui/tooltip";

const LogsPage = lazy(() => import("@/pages/explorer/Logs"));

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LogsPage />} />
          </Routes>
        </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
