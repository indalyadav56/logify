"use client"

import * as React from "react"
import { KeyRoundIcon, MailIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsSection } from "@/components/settings/settings-section"
import { MOCK_ACCOUNT } from "@/lib/settings/mock-data"

const TIMEZONES = [
  "America/Los_Angeles",
  "America/New_York",
  "America/Chicago",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "UTC",
]

export function AccountSettingsPanel() {
  const [profile, setProfile] = React.useState(MOCK_ACCOUNT)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <SettingsSection
        title="Profile"
        description="Your personal information visible to other members."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-[12px]">Full name</Label>
            <Input
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              className="h-9 text-[13px]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-[12px]">Email</Label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="h-9 text-[13px]"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Contact an admin to change your sign-in email.
            </p>
          </div>
          <div>
            <Label className="mb-1.5 text-[12px]">Job title</Label>
            <Input
              value={profile.jobTitle}
              onChange={(e) =>
                setProfile({ ...profile, jobTitle: e.target.value })
              }
              className="h-9 text-[13px]"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-[12px]">Timezone</Label>
            <Select
              value={profile.timezone}
              onValueChange={(v) => setProfile({ ...profile, timezone: v })}
            >
              <SelectTrigger className="h-9 w-full text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="text-[13px]">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            size="sm"
            onClick={() => toast.success("Profile updated")}
          >
            Save profile
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Authentication and session controls."
      >
        <div className="space-y-3">
          <SecurityRow
            icon={KeyRoundIcon}
            title="Password"
            description="Last changed 42 days ago"
            actionLabel="Change password"
          />
          <SecurityRow
            icon={ShieldCheckIcon}
            title="Multi-factor authentication"
            description="Authenticator app enabled"
            actionLabel="Manage MFA"
          />
          <SecurityRow
            icon={MailIcon}
            title="Active sessions"
            description="2 devices signed in"
            actionLabel="Review sessions"
          />
        </div>
      </SettingsSection>
    </div>
  )
}

function SecurityRow({
  icon: Icon,
  title,
  description,
  actionLabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border/60 bg-muted/20 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">{title}</p>
          <p className="text-[12px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="h-8 shrink-0 text-[12px]">
        {actionLabel}
      </Button>
    </div>
  )
}
