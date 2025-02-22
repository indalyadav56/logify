import { Navigate, RouteObject } from "react-router-dom"
import { MainLayout } from "@/components/layouts/MainLayout"
import { ProjectLayout } from "@/components/layouts/ProjectLayout"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { ProjectOverview } from "@/pages/projects/ProjectOverview"

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "projects",
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: ":projectId",
            element: <ProjectLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: "overview",
                element: <ProjectOverview />,
              },
              // Add more project routes here
            ],
          },
        ],
      },
    ],
  },
]
