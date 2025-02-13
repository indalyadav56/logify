import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

// Loading component for Suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

interface MainLayoutProps {
  className?: string;
}

export default function MainLayout({ className = "" }: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <Sidebar />
      <main className="pl-[280px] transition-all duration-300">
        <div className="container mx-auto p-6">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
