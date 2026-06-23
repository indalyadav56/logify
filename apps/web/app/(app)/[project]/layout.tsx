"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { LoaderIcon } from "lucide-react"

import { useProjectStore } from "@/lib/project-store"

/**
 * Resolves the `[project]` URL slug to a project and makes it the active one.
 * Renders inside the AppShell, so the sidebar/header reflect the selection.
 * An unknown slug (once projects have loaded) bounces back to the picker.
 */
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { project: slug } = useParams<{ project: string }>()
  const router = useRouter()
  const { projects, project, status, setProject } = useProjectStore()

  const match = React.useMemo(
    () => projects.find((p) => p.slug === slug),
    [projects, slug]
  )

  const resolved = status === "ready" || status === "error"

  React.useEffect(() => {
    if (match) {
      if (project?.id !== match.id) setProject(match)
    } else if (resolved && projects.length > 0) {
      router.replace("/projects")
    }
  }, [match, project?.id, projects.length, resolved, router, setProject])

  if (!match) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center gap-2 text-[13px] text-muted-foreground">
        <LoaderIcon className="size-4 animate-spin" />
        {resolved && projects.length > 0 ? "Project not found…" : "Loading project…"}
      </div>
    )
  }

  return <>{children}</>
}
