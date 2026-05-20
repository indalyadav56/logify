"use client"

import { AssistComposer } from "@/components/assist/assist-composer"
import { AssistHeader } from "@/components/assist/assist-header"
import { AssistMessages } from "@/components/assist/assist-messages"

export function AssistPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-muted/15">
      <AssistHeader />
      <AssistMessages />
      <AssistComposer />
    </div>
  )
}
