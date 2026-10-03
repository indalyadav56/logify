"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useInvitationToken } from "@/lib/invitation-link"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const invitationToken = useInvitationToken("invite")
  const invitationHash = invitationToken ? `#invite=${encodeURIComponent(invitationToken)}` : ""
  const signup = mode === "signup"
  const { login, register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setBusy(true)
    try {
      if (signup) await register(name.trim(), email.trim(), password)
      else await login(email.trim(), password)
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false) }
  }
  return <Card className="gap-6 rounded-xl border bg-white py-7 shadow-none ring-0">
    <CardHeader className="gap-2 px-7"><CardTitle className="text-2xl font-semibold tracking-tight">{signup ? "Create an account" : "Welcome back"}</CardTitle><CardDescription>{signup ? "A simpler place for your application logs." : "Sign in to your Logify workspace."}</CardDescription></CardHeader>
    <CardContent className="px-7">
      <form onSubmit={submit} className="space-y-5">
        {signup && <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" placeholder="Your name" required minLength={2} value={name} onChange={e => setName(e.target.value)} className="shadow-none" /></div>}
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="you@company.com" required value={email} onChange={e => setEmail(e.target.value)} className="shadow-none" /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="pr-10 shadow-none" /><Button type="button" variant="ghost" size="icon-sm" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)} className="absolute right-1 top-1 shadow-none">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></div>{signup && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}</div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={busy} className="h-10 w-full shadow-none">{busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</Button>
      </form>
    </CardContent>
    <CardFooter className="justify-center border-t px-7 pt-5 text-sm text-muted-foreground">{signup ? "Already have an account?" : "New to Logify?"}<Link href={`${signup ? "/login" : "/signup"}${invitationHash}`} className="ml-1.5 font-medium text-foreground underline-offset-4 hover:underline">{signup ? "Sign in" : "Create an account"}</Link></CardFooter>
  </Card>
}
