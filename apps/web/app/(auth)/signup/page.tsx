import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Create your Logify account",
  description:
    "Create a workspace for your application logs.",
}

export default function SignupPage() {
  return <SignupForm />
}
