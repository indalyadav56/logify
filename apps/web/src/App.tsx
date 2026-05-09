import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import LogsPage from "./pages/dashboard/logger/LogsPage";

function App() {
  return (
    <TooltipProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <LogsPage/>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}

export default App;