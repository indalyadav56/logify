import { Button } from "@/components/ui/button"
import { ProjectSwitcher } from "@/components/ProjectSwitcher"
import { CalendarDays, Download } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-4">
          <ProjectSwitcher />
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-medium">
              Overview
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Logs
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              System
            </Button>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <CalendarDays className="mr-2 h-4 w-4" />
            Sat Feb 22 2025
          </Button>
          <Button variant="default" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
    </header>
  )
}
