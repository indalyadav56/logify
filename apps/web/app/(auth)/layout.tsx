import Link from "next/link"
import { LogifyLogo } from "@/components/marketing/logo"
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RedirectIfAuthed><div className="flex min-h-svh flex-col bg-white">
    <header className="border-b px-6 py-5 sm:px-10"><Link href="/" aria-label="Logify home"><LogifyLogo /></Link></header>
    <main className="flex flex-1 items-center justify-center px-5 py-12"><div className="w-full max-w-[420px]">{children}</div></main>
    <footer className="pb-7 text-center text-xs text-muted-foreground">Logify · Simple log management</footer>
  </div></RedirectIfAuthed>
}
