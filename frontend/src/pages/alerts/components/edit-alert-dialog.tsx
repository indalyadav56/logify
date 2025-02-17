import { useEffect, useState } from "react";
import { useAlertStore, Alert } from "@/store/useAlertStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EditAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert;
  projectId: string;
}

export function EditAlertDialog({
  open,
  onOpenChange,
  alert,
  projectId,
}: EditAlertDialogProps) {
  const { updateAlert } = useAlertStore();
  const [formData, setFormData] = useState<Alert>(alert);

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [emailConfig, setEmailConfig] = useState({ recipients: "" });
  const [slackConfig, setSlackConfig] = useState({ webhook_url: "" });
  const [webhookConfig, setWebhookConfig] = useState({ url: "" });

  useEffect(() => {
    // Initialize notification channel states
    const emailChannel = alert.channels.find((c) => c.type === "email");
    const slackChannel = alert.channels.find((c) => c.type === "slack");
    const webhookChannel = alert.channels.find((c) => c.type === "webhook");

    setEmailEnabled(!!emailChannel);
    setSlackEnabled(!!slackChannel);
    setWebhookEnabled(!!webhookChannel);

    if (emailChannel) {
      setEmailConfig({
        recipients: emailChannel.config.recipients.join(", "),
      });
    }
    if (slackChannel) {
      setSlackConfig({
        webhook_url: slackChannel.config.webhook_url,
      });
    }
    if (webhookChannel) {
      setWebhookConfig({
        url: webhookChannel.config.url,
      });
    }
  }, [alert]);

  const handleSubmit = async () => {
    const channels: Alert["channels"] = [];
    if (emailEnabled) {
      channels.push({
        type: "email",
        config: {
          recipients: emailConfig.recipients.split(",").map((e) => e.trim()),
        },
      });
    }
    if (slackEnabled) {
      channels.push({
        type: "slack",
        config: slackConfig,
      });
    }
    if (webhookEnabled) {
      channels.push({
        type: "webhook",
        config: webhookConfig,
      });
    }

    await updateAlert(projectId, alert.id, {
      ...formData,
      channels,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Alert</DialogTitle>
          <DialogDescription>
            Modify your alert settings and notification preferences
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Alert Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select
                value={formData.condition.metric}
                onValueChange={(value: Alert["condition"]["metric"]) =>
                  setFormData({
                    ...formData,
                    condition: { ...formData.condition, metric: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error_rate">Error Rate</SelectItem>
                  <SelectItem value="log_volume">Log Volume</SelectItem>
                  <SelectItem value="latency">Latency</SelectItem>
                  <SelectItem value="storage">Storage Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.condition.operator}
                  onValueChange={(value: Alert["condition"]["operator"]) =>
                    setFormData({
                      ...formData,
                      condition: { ...formData.condition, operator: value },
                    })
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">{">"}</SelectItem>
                    <SelectItem value="<">{"<"}</SelectItem>
                    <SelectItem value="==">{"="}</SelectItem>
                    <SelectItem value=">=">{">="}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={formData.condition.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: {
                        ...formData.condition,
                        value: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={formData.condition.duration}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  condition: { ...formData.condition, duration: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">5 minutes</SelectItem>
                <SelectItem value="15m">15 minutes</SelectItem>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Notification Channels</Label>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts to email addresses
                  </p>
                </div>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
              {emailEnabled && (
                <Input
                  placeholder="Enter email addresses (comma-separated)"
                  value={emailConfig.recipients}
                  onChange={(e) =>
                    setEmailConfig({ recipients: e.target.value })
                  }
                />
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts to a Slack channel
                  </p>
                </div>
                <Switch
                  checked={slackEnabled}
                  onCheckedChange={setSlackEnabled}
                />
              </div>
              {slackEnabled && (
                <Input
                  placeholder="Enter Slack webhook URL"
                  value={slackConfig.webhook_url}
                  onChange={(e) =>
                    setSlackConfig({ webhook_url: e.target.value })
                  }
                />
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Webhook Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts to a custom webhook
                  </p>
                </div>
                <Switch
                  checked={webhookEnabled}
                  onCheckedChange={setWebhookEnabled}
                />
              </div>
              {webhookEnabled && (
                <Input
                  placeholder="Enter webhook URL"
                  value={webhookConfig.url}
                  onChange={(e) => setWebhookConfig({ url: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
