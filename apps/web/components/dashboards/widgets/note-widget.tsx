"use client"

export function NoteWidget({ note }: { note?: string }) {
  const text =
    note?.trim() ||
    "Add a runbook, investigation notes, or links for your team."

  return (
    <div className="flex h-full overflow-y-auto">
      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  )
}
