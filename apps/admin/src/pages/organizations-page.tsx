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
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { OrgStatusBadge, PlanBadge } from "@/components/common/status-badge"
import { fmtDate, usd } from "@/lib/format"
import { useOrgsStore } from "@/store/orgs-store"
import type { OrgPlan, OrgStatus } from "@/lib/mock-data"

const PAGE_SIZE = 12

export function OrganizationsPage() {
  const organizations = useOrgsStore((s) => s.organizations)
  const filters = useOrgsStore((s) => s.filters)
  const setFilter = useOrgsStore((s) => s.setFilter)
  const changePlan = useOrgsStore((s) => s.changePlan)
  const setStatus = useOrgsStore((s) => s.setStatus)

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return organizations.filter((o) => {
      if (filters.plan !== "all" && o.plan !== filters.plan) return false
      if (filters.status !== "all" && o.status !== filters.status) return false
      if (q && !o.name.toLowerCase().includes(q) && !o.slug.includes(q)) return false
      return true
    })
  }, [organizations, filters])

  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  return (
    <Card>
      <CardHeader className="gap-2">
        <div>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            {filtered.length} tenants — manage plans, seats and ingest quotas.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizations"
              className="h-9 w-72 pl-8"
              value={filters.search}
              onChange={(e) => {
                setFilter("search", e.target.value)
                setPage(1)
              }}
            />
          </div>

          <Select
            value={filters.plan}
            onValueChange={(v) => {
              setFilter("plan", v as OrgPlan | "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(v) => {
              setFilter("status", v as OrgStatus | "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="past_due">Past due</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Ingest</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => {
              const ingestPct = Math.min(
                100,
                Math.round((o.monthlyIngestGb / o.monthlyIngestQuotaGb) * 100)
              )
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link to={`/organizations/${o.id}`} className="font-medium hover:underline">
                      {o.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{o.slug}</div>
                  </TableCell>
                  <TableCell><PlanBadge plan={o.plan} /></TableCell>
                  <TableCell><OrgStatusBadge status={o.status} /></TableCell>
                  <TableCell className="tabular-nums">{o.seatsUsed}/{o.seats}</TableCell>
                  <TableCell className="w-56">
                    <div className="flex items-center gap-2">
                      <Progress value={ingestPct} className="h-1.5 w-28" />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {o.monthlyIngestGb.toFixed(1)}/{o.monthlyIngestQuotaGb} GB
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{usd.format(o.mrr)}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(o.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change plan</DropdownMenuLabel>
                        {(["free", "starter", "growth", "enterprise"] as OrgPlan[]).map((p) => (
                          <DropdownMenuItem key={p} onClick={() => changePlan(o.id, p)}>
                            <PlanBadge plan={p} /> <span className="ml-1 capitalize">{p}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {o.status === "active" ? (
                          <DropdownMenuItem variant="destructive" onClick={() => setStatus(o.id, "cancelled")}>
                            Suspend organization
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setStatus(o.id, "active")}>
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  No organizations match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 pt-4">
          <div className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
