import { useTeamStore, ProjectPermission } from "@/store/useTeamStore";
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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
// import { Badge } from "@/components/ui/badge";

interface CreateTeamProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_PERMISSIONS: ProjectPermission[] = [
  "view_logs",
  "view_analytics",
];

export function CreateTeam({ open, onOpenChange }: CreateTeamProps) {
  const { createTeam } = useTeamStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allowMemberInvites, setAllowMemberInvites] = useState(false);
  const [requireAdminApproval, setRequireAdminApproval] = useState(true);
  const [defaultPermissions, setDefaultPermissions] =
    useState<ProjectPermission[]>(DEFAULT_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await createTeam({
        name: name.trim(),
        description: description.trim(),
        owner_id: "current_user_id", // This should come from auth context
        members: [],
        projects: [],
        settings: {
          allow_member_invites: allowMemberInvites,
          require_admin_approval: requireAdminApproval,
          default_member_permissions: defaultPermissions,
        },
      });
      toast.success("Team created successfully");
      handleReset();
    } catch (error) {
      toast.error("Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setAllowMemberInvites(false);
    setRequireAdminApproval(true);
    setDefaultPermissions(DEFAULT_PERMISSIONS);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team to collaborate on projects.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              placeholder="Enter team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Team Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Member Invites</Label>
                  <p className="text-sm text-muted-foreground">
                    Let team members invite new members
                  </p>
                </div>
                <Switch
                  checked={allowMemberInvites}
                  onCheckedChange={setAllowMemberInvites}
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
                  checked={requireAdminApproval}
                  onCheckedChange={setRequireAdminApproval}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Default Member Permissions</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDefaultPermissions(
                    defaultPermissions.length === 0 ? DEFAULT_PERMISSIONS : []
                  )
                }
              >
                {defaultPermissions.length === 0 ? "Add Defaults" : "Clear All"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {defaultPermissions.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                </Badge>
              ))}
            </div>
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
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
