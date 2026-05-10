import * as React from "react"
import Link from "next/link"
import {
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
} from "@remixicon/react"

import { LogifyLogo } from "@/components/marketing/logo"

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Logs", href: "#features" },
      { label: "Metrics", href: "#features" },
      { label: "Traces", href: "#features" },
      { label: "Alerts", href: "#features" },
      { label: "RUM", href: "#features" },
      { label: "Synthetic", href: "#features" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For platform teams", href: "#" },
      { label: "For SREs", href: "#" },
      { label: "For developers", href: "#" },
      { label: "For security", href: "#" },
      { label: "Kubernetes", href: "#" },
      { label: "Serverless", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Pricing", href: "#pricing" },
      { label: "Contact", href: "#" },
      { label: "Security", href: "#" },
      { label: "Trust center", href: "#" },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <LogifyLogo />
            </Link>
            <p className="mt-3 max-w-xs text-[13px] text-muted-foreground">
              The AI-native observability platform for modern engineering
              teams. Logs, metrics, traces and alerts — unified.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Link
                href="#"
                aria-label="GitHub"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RiGithubFill className="size-4" />
              </Link>
              <Link
                href="#"
                aria-label="X / Twitter"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RiTwitterXFill className="size-4" />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RiLinkedinFill className="size-4" />
              </Link>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold tracking-wider text-foreground/90 uppercase">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} Logify, Inc. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              DPA
            </Link>
            <Link href="#" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
