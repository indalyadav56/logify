import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { NavMenu } from "./nav-menu";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className="hidden md:flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r">
          <div className="flex h-14 items-center border-b px-4">
            <span className="font-semibold">Observability Platform</span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <NavMenu />
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
