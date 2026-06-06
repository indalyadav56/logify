import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { LogifyLogo } from "@/components/marketing/logo"
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RedirectIfAuthed>
    <div className="relative min-h-svh bg-background">
      <main className="relative flex min-h-svh flex-col bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-brand-glow opacity-60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_65%)]"
        />

        <header className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
          <Link
            href="/"
            aria-label="Logify home"
            className="inline-flex items-center gap-2"
          >
            <LogifyLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to site
          </Link>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <footer className="relative z-10 px-6 pb-6 text-center text-[11.5px] text-muted-foreground sm:px-10">
          © {new Date().getFullYear()} Logify, Inc. ·{" "}
          <Link href="#" className="hover:text-foreground">
            Privacy
          </Link>
          {" · "}
          <Link href="#" className="hover:text-foreground">
            Terms
          </Link>
        </footer>
      </main>
    </div>
    </RedirectIfAuthed>
  )
}

