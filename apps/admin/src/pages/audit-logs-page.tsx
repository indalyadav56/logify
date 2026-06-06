import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

import { ToneBadge, type Tone } from "@/components/common/status-badge"
import { fmtDateTime, fromNow } from "@/lib/format"
import { auditLogs, type AuditAction } from "@/lib/mock-data"

const actionTone: Record<AuditAction, Tone> = {
  "user.invite": "info",
  "user.suspend": "warning",
  "user.delete": "danger",
  "org.plan_change": "info",
  "org.suspend": "warning",
  "project.create": "success",
  "project.delete": "danger",
  "billing.refund": "warning",
  "auth.login": "neutral",
}

const ACTIONS: AuditAction[] = Object.keys(actionTone) as AuditAction[]

export function AuditLogsPage() {
  const [search, setSearch] = useState("")
  const [action, setAction] = useState<AuditAction | "all">("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return auditLogs
      .filter((l) => action === "all" || l.action === action)
      .filter(
        (l) =>
          !q ||
          l.actorEmail.toLowerCase().includes(q) ||
          l.target.toLowerCase().includes(q) ||
          l.ip.includes(q)
      )
  }, [search, action])

  return (
    <Card>
      <CardHeader className="gap-2">
        <div>
          <CardTitle>Audit logs</CardTitle>
          <CardDescription>{rows.length} events — actions taken by admins and owners.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search actor, target, or IP"
              className="h-9 w-80 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={action} onValueChange={(v) => setAction(v as AuditAction | "all")}>
            <SelectTrigger className="h-9 w-52">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTIONS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="text-sm">{fmtDateTime(log.createdAt)}</div>
                  <div className="text-xs text-muted-foreground">{fromNow(log.createdAt)}</div>
                </TableCell>
                <TableCell>{log.actorEmail}</TableCell>
                <TableCell>
                  <ToneBadge tone={actionTone[log.action]}>
                    <span className="font-mono text-[11px]">{log.action}</span>
                  </ToneBadge>
                </TableCell>
                <TableCell>{log.target}</TableCell>
                <TableCell className="font-mono text-xs">{log.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
