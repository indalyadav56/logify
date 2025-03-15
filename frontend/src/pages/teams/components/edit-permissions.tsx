import { useTeamStore, Team, ProjectPermission } from "@/store/useTeamStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

interface EditPermissionsProps {
  team: Team;
  memberId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PERMISSIONS: { value: ProjectPermission; label: string }[] = [
  { value: "view_logs", label: "View Logs" },
  { value: "create_logs", label: "Create Logs" },
  { value: "delete_logs", label: "Delete Logs" },
  { value: "manage_webhooks", label: "Manage Webhooks" },
  { value: "manage_alerts", label: "Manage Alerts" },
  { value: "manage_members", label: "Manage Members" },
  { value: "manage_settings", label: "Manage Settings" },
  { value: "view_analytics", label: "View Analytics" },
];

const PERMISSION_DESCRIPTIONS: Record<ProjectPermission, string> = {
  view_logs: "View log entries and search through them",
  create_logs: "Create and send new log entries",
  delete_logs: "Delete existing log entries",
  manage_webhooks: "Create, edit, and delete webhooks",
  manage_alerts: "Configure and manage alert settings",
  manage_members: "Invite and manage team members",
  manage_settings: "Change project settings",
  view_analytics: "Access analytics and reports",
};

export function EditPermissions({
  team,
  memberId,
  open,
  onOpenChange,
}: EditPermissionsProps) {
  const { updateMemberPermissions } = useTeamStore();
  const member = team.members.find((m) => m.id === memberId);
  const [permissions, setPermissions] = useState<Record<string, ProjectPermission[]>>(
    member?.project_permissions || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!member) return;

    setIsSubmitting(true);
    try {
      for (const [projectId, projectPermissions] of Object.entries(permissions)) {
        await updateMemberPermissions(
          team.id,
          memberId,
          projectId,
          projectPermissions
        );
      }
      toast.success("Permissions updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (projectId: string, permission: ProjectPermission) => {
    setPermissions((prev) => {
      const projectPermissions = prev[projectId] || [];
      return {
        ...prev,
        [projectId]: projectPermissions.includes(permission)
          ? projectPermissions.filter((p) => p !== permission)
          : [...projectPermissions, permission],
      };
    });
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Member Permissions</DialogTitle>
          <DialogDescription>
            Manage project permissions for {member.name}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {team.projects.map((projectId) => (
              <div key={projectId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Project: {projectId}</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPermissions((prev) => ({
                          ...prev,
                          [projectId]: [],
                        }))
                      }
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPermissions((prev) => ({
                          ...prev,
                          [projectId]: PERMISSIONS.map((p) => p.value),
                        }))
                      }
                    >
                      Select All
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {PERMISSIONS.map((permission) => (
                    <div
                      key={permission.value}
                      className="flex items-start space-x-3 space-y-0"
                    >
                      <Checkbox
                        checked={permissions[projectId]?.includes(
                          permission.value
                        )}
                        onCheckedChange={() =>
                          togglePermission(projectId, permission.value)
                        }
                      />
                      <div className="space-y-1">
                        <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {permission.label}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {PERMISSION_DESCRIPTIONS[permission.value]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
