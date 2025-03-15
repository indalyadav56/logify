import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// import { useToast } from "@/components/ui/use-toast";
import { Save } from "lucide-react";

interface ProjectSettings {
  name: string;
  description: string;
  environment: string;
  retention_days: number;
  max_storage_gb: number;
  alerts_enabled: boolean;
  alert_threshold: number;
}

interface ProjectSettingsProps {
  project: {
    id: string;
    name: string;
    description?: string;
    environment: string;
    settings?: {
      retention_days?: number;
      max_storage_gb?: number;
      alerts_enabled?: boolean;
      alert_threshold?: number;
    };
  };
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
  // const { toast } = useToast();
  const [settings, setSettings] = useState<ProjectSettings>({
    name: project.name,
    description: project.description || "",
    environment: project.environment,
    retention_days: project.settings?.retention_days || 30,
    max_storage_gb: project.settings?.max_storage_gb || 5,
    alerts_enabled: project.settings?.alerts_enabled || false,
    alert_threshold: project.settings?.alert_threshold || 90,
  });

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/v1/projects/${project.id}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      // toast({
      //   title: "Success",
      //   description: "Project settings updated successfully.",
      // });
    } catch (error) {
      console.error("Failed to update settings:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to update settings. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic project settings and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={settings.description}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Environment</label>
            <Select
              value={settings.environment}
              onValueChange={(value) =>
                setSettings({ ...settings, environment: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Management</CardTitle>
          <CardDescription>
            Configure log retention and storage settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Log Retention (Days)</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.retention_days]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, retention_days: value })
                }
                max={90}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-sm">{settings.retention_days}d</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Storage (GB)</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.max_storage_gb]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, max_storage_gb: value })
                }
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-sm">{settings.max_storage_gb}GB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Configure alert settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Enable Alerts</label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when storage or error thresholds are exceeded
              </p>
            </div>
            <Switch
              checked={settings.alerts_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, alerts_enabled: checked })
              }
            />
          </div>
          {settings.alerts_enabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Alert Threshold (% of max storage)
              </label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.alert_threshold]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, alert_threshold: value })
                  }
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{settings.alert_threshold}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
