"use client"

import * as React from "react"
import { RiGithubFill, RiGoogleFill } from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function SocialButtons({ mode }: { mode: "login" | "signup" }) {
  const verb = mode === "login" ? "Sign in" : "Sign up"

  function notReady(provider: string) {
    toast.info(`${provider} sign-in isn't wired up in this preview`, {
      description: "Hook up your auth provider to enable it.",
    })
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 text-[13px]"
        onClick={() => notReady("Google")}
      >
        <RiGoogleFill className="size-4" />
        {verb} with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 text-[13px]"
        onClick={() => notReady("GitHub")}
      >
        <RiGithubFill className="size-4" />
        {verb} with GitHub
      </Button>
    </div>
  )
}

export function OrSeparator({
  label = "or continue with email",
}: {
  label?: string
}) {
  return (
    <div className="relative my-6 flex items-center">
      <span className="h-px flex-1 bg-border" />
      <span className="px-3 text-[10.5px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
