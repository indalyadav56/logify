"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  OrSeparator,
  SocialButtons,
} from "@/components/auth/social-buttons"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>(
    {}
  )

  function validate() {
    const next: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter a valid email address."
    if (password.length < 8)
      next.password = "Password must be at least 8 characters."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success("Welcome back to Logify")
      router.replace("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign you in.")
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div className="mb-7 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Sign in to continue to your Logify project.
        </p>
      </div>

      <SocialButtons mode="login" />
      <OrSeparator />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12.5px]">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            required
          />
          {errors.email ? (
            <p className="text-[11.5px] text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[12.5px]">
              Password
            </Label>
            <Link
              href="#"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            visible={showPassword}
            onToggleVisible={() => setShowPassword((v) => !v)}
            invalid={Boolean(errors.password)}
            autoComplete="current-password"
          />
          {errors.password ? (
            <p className="text-[11.5px] text-destructive">{errors.password}</p>
          ) : null}
        </div>

        <Label
          htmlFor="remember"
          className="cursor-pointer text-[12.5px] font-normal text-muted-foreground"
        >
          <Checkbox id="remember" defaultChecked />
          Keep me signed in for 30 days
        </Label>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full gap-1.5"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <LoaderIcon className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRightIcon className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
        New to Logify?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Single sign-on?{" "}
        <Link href="#" className="hover:text-foreground">
          Sign in with SAML SSO
        </Link>
      </p>
    </div>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  visible,
  onToggleVisible,
  invalid,
  autoComplete,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  visible: boolean
  onToggleVisible: () => void
  invalid?: boolean
  autoComplete?: string
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className="pr-10"
        required
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={onToggleVisible}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  )
}
