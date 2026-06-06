import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Building2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import {
  EnvBadge,
  OrgStatusBadge,
  PlanBadge,
  UserStatusBadge,
} from "@/components/common/status-badge"
import { fmtDate, fromNow, initials, usd } from "@/lib/format"
import { useOrgsStore } from "@/store/orgs-store"
import { useProjectsStore } from "@/store/projects-store"
import { useUsersStore } from "@/store/users-store"
import { invoices } from "@/lib/mock-data"

export function OrganizationDetailPage() {
  const { id = "" } = useParams()
  const org = useOrgsStore((s) => s.organizations.find((o) => o.id === id))
  const allUsers = useUsersStore((s) => s.users)
  const allProjects = useProjectsStore((s) => s.projects)

  if (!org) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div>
          <h2 className="text-lg font-medium">Organization not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been deleted or never existed.
          </p>
          <Button asChild className="mt-4">
            <Link to="/organizations">
              <ArrowLeft /> Back to list
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const orgUsers = allUsers.filter((u) => u.organizationId === org.id)
  const orgProjects = allProjects.filter((p) => p.organizationId === org.id)
  const orgInvoices = invoices.filter((i) => i.organizationId === org.id)
  const ingestPct = Math.min(
    100,
    Math.round((org.monthlyIngestGb / org.monthlyIngestQuotaGb) * 100)
  )

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/organizations" aria-label="Back">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="grid size-10 place-items-center rounded-md bg-muted">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{org.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{org.slug}</span>
              <span>·</span>
              <span>Created {fmtDate(org.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PlanBadge plan={org.plan} />
          <OrgStatusBadge status={org.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase text-muted-foreground">MRR</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{usd.format(org.mrr)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase text-muted-foreground">Seats</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {org.seatsUsed}<span className="text-base text-muted-foreground">/{org.seats}</span>
            </div>
            <Progress value={(org.seatsUsed / org.seats) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase text-muted-foreground">Ingest</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {org.monthlyIngestGb.toFixed(1)} GB
            </div>
            <Progress value={ingestPct} className="mt-2 h-1.5" />
            <div className="mt-1 text-xs text-muted-foreground">
              {ingestPct}% of {org.monthlyIngestQuotaGb} GB quota
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase text-muted-foreground">Projects</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{orgProjects.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {orgProjects.filter((p) => p.environment === "production").length} production
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users ({orgUsers.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({orgProjects.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>{initials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell><UserStatusBadge status={u.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{fromNow(u.lastActiveAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead className="text-right">Ingest /min</TableHead>
                    <TableHead className="text-right">Error %</TableHead>
                    <TableHead>Retention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgProjects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell><EnvBadge env={p.environment} /></TableCell>
                      <TableCell className="text-right tabular-nums">{p.ingestRate.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.errorRate}%</TableCell>
                      <TableCell>{p.retentionDays}d</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Recent invoices</CardTitle>
              <CardDescription>Last four billing cycles.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                      <TableCell>{fmtDate(inv.issuedAt)}</TableCell>
                      <TableCell className="capitalize">{inv.status}</TableCell>
                      <TableCell className="text-right tabular-nums">{usd.format(inv.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
