import {
  useTeamStore,
  Team,
  TeamRole,
  ProjectPermission,
} from "@/store/useTeamStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InviteMemberProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: { value: TeamRole; label: string }[] = [
  { value: "admin", label: "Admin - Full access to manage team and projects" },
  { value: "member", label: "Member - Can view and contribute to projects" },
  { value: "viewer", label: "Viewer - Can only view project data" },
];

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

export function InviteMember({ team, open, onOpenChange }: InviteMemberProps) {
  const { inviteMember } = useTeamStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<
    Record<string, ProjectPermission[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!role) {
      toast.error("Role is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await inviteMember(team.id, email.trim(), role, permissions);
      toast.success("Invitation sent successfully");
      handleReset();
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setRole("member");
    setSelectedProjects([]);
    setPermissions({});
    onOpenChange(false);
  };

  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
      const { [projectId]: _, ...rest } = permissions;
      setPermissions(rest);
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
      setPermissions({
        ...permissions,
        [projectId]: ["view_logs", "view_analytics"],
      });
    }
  };

  // const togglePermission = (
  //   projectId: string,
  //   permission: ProjectPermission
  // ) => {
  //   setPermissions((prev) => {
  //     const projectPermissions = prev[projectId] || [];
  //     return {
  //       ...prev,
  //       [projectId]: projectPermissions.includes(permission)
  //         ? projectPermissions.filter((p) => p !== permission)
  //         : [...projectPermissions, permission],
  //     };
  //   });
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your team and set their permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(value: TeamRole) => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span>{r.value}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Project Access</Label>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {team.projects.map((projectId) => (
                  <div key={projectId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedProjects.includes(projectId)}
                        onCheckedChange={() =>
                          toggleProjectSelection(projectId)
                        }
                      />
                      <span className="font-medium">Project: {projectId}</span>
                    </div>
                    {/* {selectedProjects.includes(projectId) && (
                      <div className="ml-6 flex flex-wrap gap-2">
                        {PERMISSIONS.map((permission) => (
                          // <Badge
                          //   key={permission.value}
                          //   variant={
                          //     permissions[projectId]?.includes(permission.value)
                          //       ? "default"
                          //       : "outline"
                          //   }
                          //   className="cursor-pointer"
                          //   onClick={() =>
                          //     togglePermission(projectId, permission.value)
                          //   }
                          // >
                          //   {permission.label}
                          // </Badge>
                        ))}
                      </div>
                    )} */}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
