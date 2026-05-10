import * as React from "react"

const LOGOS: { name: string; mark: React.ReactNode }[] = [
  {
    name: "Northwind",
    mark: (
      <span className="font-serif text-[18px] tracking-tight">Northwind</span>
    ),
  },
  {
    name: "Vector",
    mark: (
      <span className="text-[18px] font-semibold tracking-tight">
        ▲ vector
      </span>
    ),
  },
  {
    name: "Lumen",
    mark: (
      <span className="text-[18px] font-medium tracking-[0.18em] uppercase">
        Lumen
      </span>
    ),
  },
  {
    name: "Acme Cloud",
    mark: (
      <span className="text-[18px] font-bold tracking-tight">
        acme<span className="text-emerald-400">.</span>cloud
      </span>
    ),
  },
  {
    name: "Helios",
    mark: <span className="text-[18px] font-semibold italic">Helios</span>,
  },
  {
    name: "Quanta",
    mark: (
      <span className="text-[18px] font-semibold tracking-tight">
        ◇ Quanta
      </span>
    ),
  },
  {
    name: "Rivet",
    mark: (
      <span className="text-[18px] font-mono font-medium">{`{rivet}`}</span>
    ),
  },
  {
    name: "Polar",
    mark: (
      <span className="text-[18px] font-semibold tracking-tight">★ Polar</span>
    ),
  },
]

export function LogoCloud() {
  return (
    <section className="border-y border-border/50 bg-background/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Trusted by engineering teams shipping at scale
        </p>
        <div className="mt-7 grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-7 text-muted-foreground/80 sm:grid-cols-4 lg:grid-cols-8">
          {LOGOS.map((l) => (
            <div
              key={l.name}
              className="opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              aria-label={l.name}
            >
              {l.mark}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
