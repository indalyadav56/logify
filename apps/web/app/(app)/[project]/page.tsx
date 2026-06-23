"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

/** A bare /<project> URL just opens that project's logs. */
export default function ProjectIndexPage() {
  const { project } = useParams<{ project: string }>()
  const router = useRouter()

  React.useEffect(() => {
    router.replace(`/${project}/logs`)
  }, [project, router])

  return null
}
