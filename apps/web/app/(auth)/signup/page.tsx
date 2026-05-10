import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Create your Logify workspace",
  description:
    "Start your free 30-day Logify trial. No credit card required.",
}

export default function SignupPage() {
  return <SignupForm />
}
