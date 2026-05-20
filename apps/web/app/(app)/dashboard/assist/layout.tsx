import { AssistStoreProvider } from "@/lib/assist/assist-store"

export default function AssistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AssistStoreProvider>{children}</AssistStoreProvider>
}
