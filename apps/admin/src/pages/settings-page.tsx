import { useState } from "react"
import { Copy, KeyRound, RefreshCw } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [requireMfa, setRequireMfa] = useState(true)
  const [signups, setSignups] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [slackAlerts, setSlackAlerts] = useState(true)
  const [retention, setRetention] = useState("30")
  const [apiKey, setApiKey] = useState("lk_live_•••••••••••••••••• 2f9a")

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Top-level settings for Logify Admin.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue="Logify HQ" />
          </div>
          <div className="grid gap-2">
            <Label>Default retention (days)</Label>
            <Select value={retention} onValueChange={setRetention}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["7", "14", "30", "60", "90"].map((d) => (
                  <SelectItem key={d} value={d}>{d} days</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Authentication and access controls.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ToggleRow
            label="Require MFA for admins"
            description="Force second-factor on all admin and owner accounts."
            checked={requireMfa}
            onChange={setRequireMfa}
          />
          <Separator />
          <ToggleRow
            label="Allow public sign-ups"
            description="Anyone with a verified email can create an organization."
            checked={signups}
            onChange={setSignups}
          />
          <Separator />
          <div className="grid gap-2">
            <Label className="inline-flex items-center gap-2">
              <KeyRound className="size-4" /> Admin API key
            </Label>
            <div className="flex gap-2">
              <Input value={apiKey} readOnly className="font-mono" />
              <Button variant="outline" size="icon" aria-label="Copy">
                <Copy className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setApiKey(`lk_live_${Math.random().toString(36).slice(2, 10)}`)}
              >
                <RefreshCw /> Rotate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Where to send platform alerts.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ToggleRow
            label="Email digest"
            description="Daily summary delivered to admins."
            checked={emailAlerts}
            onChange={setEmailAlerts}
          />
          <Separator />
          <ToggleRow
            label="Slack alerts"
            description="Real-time incident notifications in #logify-ops."
            checked={slackAlerts}
            onChange={setSlackAlerts}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Irreversible operational actions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between rounded-md border border-destructive/20 p-3">
            <div>
              <div className="text-sm font-medium">Pause ingest globally</div>
              <div className="text-xs text-muted-foreground">Stop accepting new events across all tenants.</div>
            </div>
            <Button variant="destructive">Pause</Button>
          </div>
          <div className="flex items-center justify-between rounded-md border border-destructive/20 p-3">
            <div>
              <div className="text-sm font-medium">Purge soft-deleted data</div>
              <div className="text-xs text-muted-foreground">Permanently remove tombstoned records older than 7 days.</div>
            </div>
            <Button variant="destructive">Purge</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-0.5">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
