import { Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

export function LogifyMark({ className }: { className?: string }) {
  return <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white", className)}><Terminal className="size-[18px]" aria-hidden /></span>
}

export function LogifyLogo({ className, withWordmark = true, wordmarkClassName }: { className?: string; withWordmark?: boolean; wordmarkClassName?: string }) {
  return <span className={cn("inline-flex items-center gap-2.5", className)}><LogifyMark />{withWordmark && <span className={cn("text-lg font-semibold tracking-tight text-foreground", wordmarkClassName)}>Logify<span className="text-muted-foreground">.</span></span>}</span>
}
