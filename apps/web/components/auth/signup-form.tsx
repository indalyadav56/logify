"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  XIcon,
} from "lucide-react"
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

type Errors = {
  name?: string
  email?: string
  password?: string
  terms?: string
}

export function SignupForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [terms, setTerms] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Errors>({})

  const checks = passwordChecks(password)
  const score = checks.filter((c) => c.passed).length

  function validate() {
    const next: Errors = {}
    if (name.trim().length < 2) next.name = "Tell us your name."
    if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter a valid work email."
    if (score < 3)
      next.password = "Pick a stronger password — meet at least 3 rules."
    if (!terms) next.terms = "Please accept the terms to continue."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register(name.trim(), email, password)
      toast.success(`Welcome to Logify, ${name.split(" ")[0]}!`, {
        description: "Your free 30-day Pro trial just started.",
      })
      router.replace("/dashboard")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't create your account."
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div className="mb-7 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Create your project
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Free 30-day trial · No credit card required
        </p>
      </div>

      <SocialButtons mode="signup" />
      <OrSeparator />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[12.5px]">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Avery Moore"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            required
          />
          {errors.name ? (
            <p className="text-[11.5px] text-destructive">{errors.name}</p>
          ) : null}
        </div>

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
          <Label htmlFor="password" className="text-[12.5px]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              className="pr-10"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>

          <PasswordStrength score={score} />

          <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
            {checks.map((c) => (
              <li
                key={c.label}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] transition-colors",
                  c.passed ? "text-primary" : "text-muted-foreground"
                )}
              >
                {c.passed ? (
                  <CheckIcon className="size-3" />
                ) : (
                  <XIcon className="size-3" />
                )}
                {c.label}
              </li>
            ))}
          </ul>

          {errors.password ? (
            <p className="text-[11.5px] text-destructive">{errors.password}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="terms"
            className="items-start text-[12.5px] font-normal leading-snug text-muted-foreground"
          >
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(v) => setTerms(v === true)}
              className="mt-0.5"
            />
            <span>
              I agree to Logify&apos;s{" "}
              <Link href="#" className="text-foreground underline-offset-4 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-foreground underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </Label>
          {errors.terms ? (
            <p className="text-[11.5px] text-destructive">{errors.terms}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full gap-1.5"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <LoaderIcon className="size-4 animate-spin" /> Creating project…
            </>
          ) : (
            <>
              Create project <ArrowRightIcon className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

function passwordChecks(pw: string) {
  return [
    { label: "8+ characters", passed: pw.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(pw) },
    { label: "Number", passed: /\d/.test(pw) },
    { label: "Symbol", passed: /[^A-Za-z0-9]/.test(pw) },
  ]
}

function PasswordStrength({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"]
  const tones = [
    "bg-rose-500",
    "bg-rose-500",
    "bg-amber-400",
    "bg-primary",
    "bg-primary",
  ]
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < score ? tones[score] : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="w-16 text-right text-[10.5px] font-medium text-muted-foreground">
        {labels[score]}
      </span>
    </div>
  )
}
