import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { LogifyLogo } from "@/components/marketing/logo"
import { AuthAside } from "@/components/auth/auth-aside"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="relative grid min-h-svh grid-cols-1 bg-background lg:grid-cols-[1fr_minmax(0,520px)]">
      <AuthAside />

      <main className="relative flex min-h-svh flex-col">
        <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
          <Link
            href="/"
            aria-label="Logify home"
            className="inline-flex items-center gap-2"
          >
            <LogifyLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to site
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <footer className="px-6 pb-6 text-center text-[11.5px] text-muted-foreground sm:px-10">
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
  )
}
