"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type RevealProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Stagger entrance by N milliseconds. */
  delay?: number
  /** Render as a different element while keeping reveal behavior. */
  as?: "div" | "section"
}

/**
 * Fades + lifts its children into view the first time they enter the viewport.
 * Animation is CSS-driven (see `.reveal` in globals.css) and is automatically
 * disabled under `prefers-reduced-motion`.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  style,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node || shown) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shown])

  const Comp = as

  return (
    <Comp
      ref={ref as never}
      data-shown={shown}
      className={cn("reveal", className)}
      style={{ ["--reveal-delay" as string]: `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Comp>
  )
}
