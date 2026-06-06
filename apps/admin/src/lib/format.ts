import { formatDistanceToNow, format } from "date-fns"

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export const compactNum = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function fromNow(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function fmtDate(iso: string) {
  return format(new Date(iso), "MMM d, yyyy")
}

export function fmtDateTime(iso: string) {
  return format(new Date(iso), "MMM d, HH:mm")
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}
