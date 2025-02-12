import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "@/context/ProjectContext";
import LogExplorer from "@/pages/explorer/LogExplorer";
import UserJourney from "./pages/journey/UserJourney";

function App() {
  return (
    <ProjectProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LogExplorer />} />
            <Route path="/journey" element={<UserJourney />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ProjectProvider>
  );
}

export default App;
