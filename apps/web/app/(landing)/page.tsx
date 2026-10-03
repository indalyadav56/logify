import Link from "next/link"
import { ArrowRight, Folder, Search, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return <div className="mx-auto max-w-6xl px-6">
    <section className="mx-auto max-w-2xl py-20 text-center sm:py-24">
      <Badge variant="outline" className="rounded-full bg-white px-3 py-1 text-xs font-normal text-muted-foreground">Less noise. More clarity.</Badge>
      <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Your logs,<br />finally in one place.</h1>
      <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground">Collect your application logs, find what matters, and understand what happened. A simple workspace to keep everything in focus.</p>
      <Button asChild className="mt-8 h-11 px-6 shadow-none"><Link href="/signup">Get started<ArrowRight className="size-4" /></Link></Button>
    </section>
    <Card className="gap-0 rounded-xl border p-0 shadow-none ring-0">
      <div className="flex items-center justify-between border-b px-5 py-4"><span className="text-sm font-medium">Application logs</span><Badge variant="secondary" className="rounded-md font-normal">Preview</Badge></div>
      <div className="flex items-center gap-2 border-b p-5 text-sm text-muted-foreground"><Search className="size-4" />Search log messages…</div>
      <div className="overflow-x-auto"><div className="min-w-[650px]">{[['10:42:03', 'info', 'api', 'Request completed in 42ms'], ['10:42:02', 'info', 'worker', 'Background job processed successfully'], ['10:42:01', 'warn', 'api', 'Slow response from upstream service'], ['10:41:59', 'info', 'auth', 'User session created']].map(([time, level, service, message]) => <div key={time} className="grid grid-cols-[110px_90px_100px_1fr] items-center gap-5 border-b px-5 py-4 last:border-0"><span className="font-mono text-xs text-muted-foreground">{time}</span><Badge variant="outline" className={level === 'warn' ? "w-fit rounded-md border-amber-200 bg-amber-50 text-amber-700" : "w-fit rounded-md border-blue-200 bg-blue-50 text-blue-700"}>{level}</Badge><span className="text-xs font-medium">{service}</span><span className="font-mono text-xs">{message}</span></div>)}</div></div>
    </Card>
    <section className="grid gap-8 py-16 sm:grid-cols-3">{[[Terminal, 'Connect your application', 'Send structured logs through the ingest API or a Logify SDK.'], [Search, 'Find the right event', 'Search messages and narrow the time range in a few clicks.'], [Folder, 'Keep projects organized', 'Give each application a clear home for its logs.']].map(([Icon, title, text]) => { const FeatureIcon = Icon as typeof Terminal; return <div key={String(title)}><FeatureIcon className="mb-4 size-5 text-muted-foreground" /><h2 className="text-sm font-semibold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(text)}</p></div> })}</section>
  </div>
}
