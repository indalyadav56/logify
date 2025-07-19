import { useTeamStore, Team } from "@/store/useTeamStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

interface TeamSettingsProps {
  team: Team;
}

export function TeamSettings({ team }: TeamSettingsProps) {
  const { updateTeam } = useTeamStore();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [settings, setSettings] = useState(team.settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTeam(team.id, {
        name: name.trim(),
        description: description.trim(),
        settings,
      });
      toast.success("Team settings updated successfully");
    } catch (error) {
      toast.error("Failed to update team settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-muted/50">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Team Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage team settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your team"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Team Permissions</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Member Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Let team members invite new members
                </p>
              </div>
              <Switch
                checked={settings.allow_member_invites}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    allow_member_invites: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Admin Approval</Label>
                <p className="text-sm text-muted-foreground">
                  New members need admin approval to join
                </p>
              </div>
              <Switch
                checked={settings.require_admin_approval}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    require_admin_approval: checked,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Default Member Permissions</h4>
          <div className="flex flex-wrap gap-2">
            {/* {settings.default_member_permissions.map((permission) => (
              <Badge key={permission} variant="secondary">
                {permission}
              </Badge>
            ))} */}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Team Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(team.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>Members</Label>
              <p className="text-sm text-muted-foreground">
                {team.members.length} members
              </p>
            </div>
            <div>
              <Label>Projects</Label>
              <p className="text-sm text-muted-foreground">
                {team.projects.length} projects
              </p>
            </div>
            <div>
              <Label>Team ID</Label>
              <p className="text-sm font-mono text-muted-foreground">
                {team.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
