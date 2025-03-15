import { useState } from "react";
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
import { Slider } from "@/components/ui/slider";

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CreateAlertDialog({
  open,
  onOpenChange,
  projectId,
}: CreateAlertDialogProps) {
  const { createAlert } = useAlertStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "error" as Alert["type"],
    condition: {
      metric: "error_rate" as Alert["condition"]["metric"],
      operator: ">" as Alert["condition"]["operator"],
      value: 0,
      duration: "5m",
    },
    channels: [] as Alert["channels"],
  });

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [emailConfig, setEmailConfig] = useState({ recipients: "" });
  const [slackConfig, setSlackConfig] = useState({ webhook_url: "" });
  const [webhookConfig, setWebhookConfig] = useState({ url: "" });

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

    await createAlert(projectId, {
      ...formData,
      channels,
      status: "active",
      project_id: projectId,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "error",
      condition: {
        metric: "error_rate",
        operator: ">",
        value: 0,
        duration: "5m",
      },
      channels: [],
    });
    setEmailEnabled(false);
    setSlackEnabled(false);
    setWebhookEnabled(false);
    setEmailConfig({ recipients: "" });
    setSlackConfig({ webhook_url: "" });
    setWebhookConfig({ url: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>
            Set up an alert to monitor your logs and get notified when something
            goes wrong
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
              placeholder="e.g., High Error Rate Alert"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this alert is monitoring..."
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
          <Button onClick={handleSubmit}>Create Alert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
