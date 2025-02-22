import * as React from "react"
import {
  LayoutDashboard,
  ScrollText,
  Users,
  Settings,
  Folder,
  ChevronDown,
} from "lucide-react"
import { Link, useLocation, useParams } from "react-router-dom"
import { mainMenus, getProjectMenus } from "@/config/menu"
import { useProjectStore } from "@/store/useProjectStore"
import { cn } from "@/lib/utils"

const iconMap = {
  dashboard: LayoutDashboard,
  logs: ScrollText,
  users: Users,
  settings: Settings,
  folder: Folder,
}

export function AppSidebar() {
  const location = useLocation()
  const { projectId } = useParams()
  const { currentProject } = useProjectStore()
  const [isProjectMenuOpen, setIsProjectMenuOpen] = React.useState(true)

  const projectMenus = projectId ? getProjectMenus(projectId) : []
  const isInProjectContext = location.pathname.includes('/projects/')

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-14 transition-transform dark:border-gray-700 dark:bg-gray-800 sm:translate-x-0">
      <div className="h-full overflow-y-auto bg-white px-3 pb-4 dark:bg-gray-800">
        {/* Project Selector */}
        {currentProject && (
          <div className="mb-6 mt-2">
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <span className="flex items-center">
                <Folder className="mr-2 h-5 w-5" />
                {currentProject.name}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isProjectMenuOpen ? "rotate-180" : ""
                )}
              />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <ul className="space-y-2 font-medium">
          {/* Project-specific menu items */}
          {isInProjectContext && projectMenus.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            return (
              <li key={item.route}>
                <Link
                  to={item.route}
                  className={cn(
                    "flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
                    location.pathname === item.route && "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="ml-3">{item.title}</span>
                </Link>
                {item.children && (
                  <ul className="space-y-2 py-2 pl-6">
                    {item.children.map((child) => (
                      <li key={child.route}>
                        <Link
                          to={child.route}
                          className={cn(
                            "flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
                            location.pathname === child.route && "bg-gray-100 dark:bg-gray-700"
                          )}
                        >
                          <span>{child.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}

          {/* Main menu items */}
          {!isInProjectContext && mainMenus.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            return (
              <li key={item.route}>
                <Link
                  to={item.route}
                  className={cn(
                    "flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
                    location.pathname === item.route && "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
