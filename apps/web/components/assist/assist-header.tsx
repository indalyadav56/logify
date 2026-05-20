"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronDownIcon,
  HelpCircleIcon,
  PanelRightIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAssistStore } from "@/lib/assist/assist-store"

export function AssistHeader() {
  const {
    conversations,
    active,
    newConversation,
    selectConversation,
    renameConversation,
  } = useAssistStore()
  const [renaming, setRenaming] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState(active.title)

  React.useEffect(() => {
    setTitleDraft(active.title)
    setRenaming(false)
  }, [active.id, active.title])

  const commitRename = () => {
    renameConversation(active.id, titleDraft)
    setRenaming(false)
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 max-w-[min(320px,50vw)] gap-1.5 px-2 font-semibold"
          >
            <span className="truncate text-[13.5px]">{active.title}</span>
            <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-[11px]">
            Conversations
          </DropdownMenuLabel>
          {conversations.map((conv) => (
            <DropdownMenuItem
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="truncate text-[13px] font-medium">
                {conv.title}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {conv.messages.length} message
                {conv.messages.length === 1 ? "" : "s"}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => newConversation()}>
            <PlusIcon className="size-3.5" />
            New conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {renaming ? (
        <Input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename()
            if (e.key === "Escape") setRenaming(false)
          }}
          className="h-8 max-w-xs text-[13px]"
          autoFocus
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px] text-muted-foreground"
          onClick={() => setRenaming(true)}
        >
          Rename
        </Button>
      )}

      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="New conversation"
          onClick={() => newConversation()}
        >
          <PlusIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Assist settings">
          <SettingsIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Help">
          <HelpCircleIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Panel layout">
          <PanelRightIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Close Assist" asChild>
          <Link href="/dashboard/logs">
            <XIcon />
          </Link>
        </Button>
      </div>
    </header>
  )
}
