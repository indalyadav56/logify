"use client"

import { filterSlashCommands } from "@/lib/assist/prompt-catalog"

export function AssistSlashMenu({
  query,
  onSelect,
}: {
  query: string
  onSelect: (insert: string) => void
}) {
  const commands = filterSlashCommands(query)

  if (commands.length === 0) return null

  return (
    <ul className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
      {commands.map((cmd) => (
        <li key={cmd.id}>
          <button
            type="button"
            className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted/60"
            onClick={() => onSelect(cmd.insert)}
          >
            <span className="font-mono text-[12px] font-medium text-primary">
              {cmd.command}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {cmd.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
