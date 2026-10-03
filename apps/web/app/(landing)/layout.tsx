import Link from "next/link"
import { LogifyLogo } from "@/components/marketing/logo"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-white">
    <header className="border-b"><div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6"><Link href="/" aria-label="Logify home"><LogifyLogo /></Link><div className="flex gap-2"><Button asChild variant="ghost" className="shadow-none"><Link href="/login">Sign in</Link></Button><Button asChild className="shadow-none"><Link href="/signup">Get started</Link></Button></div></div></header>
    <main>{children}</main>
    <footer className="mx-auto mt-16 flex max-w-6xl justify-between border-t px-6 py-7 text-xs text-muted-foreground"><span>Logify · Simple log management</span><span>Built for your applications.</span></footer>
  </div>
}
