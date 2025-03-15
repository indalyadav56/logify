import { useWebhookStore, WebhookEventType } from "@/store/useWebhookStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateWebhookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEBHOOK_EVENTS: { value: WebhookEventType; label: string }[] = [
  { value: "log.created", label: "Log Created" },
  { value: "log.error", label: "Log Error" },
  { value: "log.warning", label: "Log Warning" },
  { value: "project.created", label: "Project Created" },
  { value: "project.updated", label: "Project Updated" },
  { value: "project.deleted", label: "Project Deleted" },
  { value: "alert.triggered", label: "Alert Triggered" },
];

export function CreateWebhook({ open, onOpenChange }: CreateWebhookProps) {
  const { createWebhook } = useWebhookStore();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([]);
  const [retryCount, setRetryCount] = useState("3");
  const [timeout, setTimeout] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }

    if (!selectedEvents.length) {
      toast.error("Select at least one event");
      return;
    }

    try {
      setIsSubmitting(true);
      await createWebhook({
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
        events: selectedEvents,
        active: true,
        project_id: "default", // This should come from context or props
        retry_count: parseInt(retryCount),
        timeout: parseInt(timeout),
      });
      toast.success("Webhook created successfully");
      handleReset();
    } catch (error) {
      toast.error("Failed to create webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setUrl("");
    setDescription("");
    setSelectedEvents([]);
    setRetryCount("3");
    setTimeout("10");
    onOpenChange(false);
  };

  const handleEventSelect = (event: WebhookEventType) => {
    if (!selectedEvents.includes(event)) {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleEventRemove = (event: WebhookEventType) => {
    setSelectedEvents(selectedEvents.filter((e) => e !== event));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Webhook</DialogTitle>
          <DialogDescription>
            Create a new webhook endpoint to receive real-time event notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Webhook name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://api.example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Webhook description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Events</Label>
            <Select onValueChange={(value) => handleEventSelect(value as WebhookEventType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select events to subscribe to" />
              </SelectTrigger>
              <SelectContent>
                {WEBHOOK_EVENTS.map((event) => (
                  <SelectItem
                    key={event.value}
                    value={event.value}
                    disabled={selectedEvents.includes(event.value)}
                  >
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEvents.map((event) => (
                <Badge
                  key={event}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {event}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleEventRemove(event)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="retryCount">Retry Count</Label>
              <Input
                id="retryCount"
                type="number"
                min="0"
                max="10"
                value={retryCount}
                onChange={(e) => setRetryCount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                max="30"
                value={timeout}
                onChange={(e) => setTimeout(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Webhook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
