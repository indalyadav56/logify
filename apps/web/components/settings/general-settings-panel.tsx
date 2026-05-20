"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/settings/settings-section"
import {
  MOCK_NOTIFICATIONS,
  MOCK_ORG_SETTINGS,
} from "@/lib/settings/mock-data"

export function GeneralSettingsPanel() {
  const [org, setOrg] = React.useState(MOCK_ORG_SETTINGS)
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS)

  const saveOrg = () => {
    toast.success("Organization settings saved")
  }

  const saveNotifications = () => {
    toast.success("Notification preferences saved")
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <SettingsSection
        title="Organization"
        description="Workspace identity and defaults applied across Logify."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organization name">
            <Input
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              className="h-9 text-[13px]"
            />
          </Field>
          <Field label="URL slug">
            <Input
              value={org.slug}
              onChange={(e) => setOrg({ ...org, slug: e.target.value })}
              className="font-code h-9 text-[13px]"
            />
          </Field>
          <Field label="Support email" className="sm:col-span-2">
            <Input
              type="email"
              value={org.supportEmail}
              onChange={(e) =>
                setOrg({ ...org, supportEmail: e.target.value })
              }
              className="h-9 text-[13px]"
            />
          </Field>
          <Field label="Default log retention (days)">
            <Input
              type="number"
              min={1}
              max={365}
              value={org.defaultRetentionDays}
              onChange={(e) =>
                setOrg({
                  ...org,
                  defaultRetentionDays: Number(e.target.value) || 1,
                })
              }
              className="h-9 text-[13px]"
            />
          </Field>
        </div>

        <div className="mt-5 space-y-4 border-t border-border/60 pt-4">
          <ToggleRow
            label="Enforce MFA for all members"
            description="Require multi-factor authentication on every sign-in."
            checked={org.enforceMfa}
            onCheckedChange={(v) => setOrg({ ...org, enforceMfa: v })}
          />
          <ToggleRow
            label="Allow members to invite others"
            description="Editors can send invitations without admin approval."
            checked={org.allowMemberInvites}
            onCheckedChange={(v) => setOrg({ ...org, allowMemberInvites: v })}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button size="sm" onClick={saveOrg}>
            Save organization
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Email and in-app alerts for your account."
      >
        <div className="space-y-4">
          <ToggleRow
            label="Alert digest"
            description="Daily summary of firing and resolved alerts."
            checked={notifications.alertDigest}
            onCheckedChange={(v) =>
              setNotifications({ ...notifications, alertDigest: v })
            }
          />
          <ToggleRow
            label="Weekly usage report"
            description="Ingest volume, top services, and error trends."
            checked={notifications.weeklyReport}
            onCheckedChange={(v) =>
              setNotifications({ ...notifications, weeklyReport: v })
            }
          />
          <ToggleRow
            label="Product updates"
            description="New features and platform announcements."
            checked={notifications.productUpdates}
            onCheckedChange={(v) =>
              setNotifications({ ...notifications, productUpdates: v })
            }
          />
          <ToggleRow
            label="Security alerts"
            description="Sign-in anomalies and policy changes."
            checked={notifications.securityAlerts}
            onCheckedChange={(v) =>
              setNotifications({ ...notifications, securityAlerts: v })
            }
          />
        </div>
        <div className="mt-5 flex justify-end">
          <Button size="sm" variant="outline" onClick={saveNotifications}>
            Save notifications
          </Button>
        </div>
      </SettingsSection>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-[12px] font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
