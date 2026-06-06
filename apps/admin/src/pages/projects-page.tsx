import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { MoreHorizontal, Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EnvBadge } from "@/components/common/status-badge"
import { fmtDate } from "@/lib/format"
import { useProjectsStore } from "@/store/projects-store"
import { useOrgsStore } from "@/store/orgs-store"
import type { Project } from "@/lib/mock-data"

const PAGE_SIZE = 12

export function ProjectsPage() {
  const projects = useProjectsStore((s) => s.projects)
  const filters = useProjectsStore((s) => s.filters)
  const setFilter = useProjectsStore((s) => s.setFilter)
  const setRetention = useProjectsStore((s) => s.setRetention)
  const remove = useProjectsStore((s) => s.remove)
  const orgs = useOrgsStore((s) => s.organizations)

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return projects.filter((p) => {
      if (filters.environment !== "all" && p.environment !== filters.environment)
        return false
      if (
        filters.organizationId !== "all" &&
        p.organizationId !== filters.organizationId
      )
        return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [projects, filters])

  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )
  const orgName = (id: string) => orgs.find((o) => o.id === id)

  return (
    <Card>
      <CardHeader className="gap-2">
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            {filtered.length} projects across all environments and tenants.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects"
              className="h-9 w-72 pl-8"
              value={filters.search}
              onChange={(e) => {
                setFilter("search", e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select
            value={filters.environment}
            onValueChange={(v) => {
              setFilter("environment", v as Project["environment"] | "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Environment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.organizationId}
            onValueChange={(v) => {
              setFilter("organizationId", v)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Organization" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {orgs.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Env</TableHead>
              <TableHead className="text-right">Ingest /min</TableHead>
              <TableHead className="text-right">Error %</TableHead>
              <TableHead>Retention</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const o = orgName(p.organizationId)
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    {o ? (
                      <Link to={`/organizations/${o.id}`} className="hover:underline">
                        {o.name}
                      </Link>
                    ) : "—"}
                  </TableCell>
                  <TableCell><EnvBadge env={p.environment} /></TableCell>
                  <TableCell className="text-right tabular-nums">{p.ingestRate.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.errorRate}%</TableCell>
                  <TableCell>{p.retentionDays}d</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Retention</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={String(p.retentionDays)}
                          onValueChange={(v) => setRetention(p.id, Number(v))}
                        >
                          {[7, 14, 30, 60, 90].map((d) => (
                            <DropdownMenuRadioItem key={d} value={String(d)}>
                              {d} days
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => remove(p.id)}>
                          Delete project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
