import * as React from "react"

import { cn } from "@/lib/utils"

export function LogifyMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <defs>
        <linearGradient
          id="logify-grad"
          x1="2"
          y1="2"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="oklch(0.78 0.19 150)" />
          <stop offset="1" stopColor="oklch(0.45 0.16 165)" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="url(#logify-grad)"
      />
      <path
        d="M9 9.5v13h13"
        stroke="white"
        strokeOpacity=".95"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 18.5l3.5-4 3.5 2.5 4-6"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LogifyLogo({
  className,
  withWordmark = true,
}: {
  className?: string
  withWordmark?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogifyMark />
      {withWordmark ? (
        <span className="text-[15px] font-semibold tracking-tight">
          Logify
        </span>
      ) : null}
    </span>
  )
}
