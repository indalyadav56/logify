import { useWebhookStore } from "@/store/useWebhookStore";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Copy,
  Key,
  MoreHorizontal,
  PlayCircle,
  StopCircle,
  Trash,
  XCircle,
} from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { WebhookDeliveries } from "./webhook-deliveries";
import { toast } from "sonner";

interface WebhookListProps {
  showActive: boolean;
  searchQuery: string;
}

export function WebhookList({ showActive, searchQuery }: WebhookListProps) {
  const { webhooks, toggleWebhook, deleteWebhook, rotateSecret } =
    useWebhookStore();
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  const filteredWebhooks = webhooks
    .filter((webhook) => webhook.active === showActive)
    .filter(
      (webhook) =>
        webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webhook.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  // const getEventBadgeColor = (event: WebhookEventType) => {
  //   if (event.includes("error")) return "destructive";
  //   if (event.includes("warning")) return "warning";
  //   if (event.includes("created")) return "success";
  //   return "secondary";
  // };

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Last Delivery</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWebhooks.map((webhook) => (
            <>
              <TableRow key={webhook.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{webhook.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {webhook.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {webhook.url}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {/* {webhook.events.map((event) => (
                      <Badge key={event} variant={getEventBadgeColor(event)}>
                        {event}
                      </Badge>
                    ))} */}
                  </div>
                </TableCell>
                <TableCell>
                  {webhook.last_delivery ? (
                    <div className="flex items-center gap-2">
                      {webhook.last_delivery.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span>
                        {/* {formatDistanceToNow(
                          new Date(webhook.last_delivery.created_at),
                          { addSuffix: true }
                        )} */}
                      </span>
                    </div>
                  ) : (
                    "No deliveries yet"
                  )}
                </TableCell>
                <TableCell>
                  {/* {formatDistanceToNow(new Date(webhook.created_at), {
                    addSuffix: true,
                  })} */}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toggleWebhook(webhook.id)}
                      >
                        {webhook.active ? (
                          <>
                            <StopCircle className="mr-2 h-4 w-4" /> Deactivate
                          </>
                        ) : (
                          <>
                            <PlayCircle className="mr-2 h-4 w-4" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => rotateSecret(webhook.id)}
                      >
                        <Key className="mr-2 h-4 w-4" /> Rotate Secret
                      </DropdownMenuItem>
                      {webhook.secret && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleCopySecret(webhook.secret!.value)
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy Secret
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedWebhook(
                            selectedWebhook === webhook.id ? null : webhook.id
                          )
                        }
                      >
                        View Deliveries
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {selectedWebhook === webhook.id && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <WebhookDeliveries webhookId={webhook.id} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
