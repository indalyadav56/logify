import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in · Logify",
  description: "Sign in to your Logify workspace.",
}

export default function LoginPage() {
  return <LoginForm />
}
