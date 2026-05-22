"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogifyLogo } from "@/components/marketing/logo"

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "#platform", label: "Platform" },
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
]

export function MarketingNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[border-color,background-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground"
          aria-label="Logify home"
        >
          <LogifyLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-8 gap-1 px-3 text-[12.5px] font-medium"
          >
            <Link href="/signup">
              Start free <ArrowRightIcon className="size-3.5" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="ml-auto inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="/signup">Start free</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
