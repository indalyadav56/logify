import { useTeamStore, Team, TeamRole, ProjectPermission } from "@/store/useTeamStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { InviteMember } from "./invite-member";
import { EditPermissions } from "./edit-permissions";
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";

interface TeamMembersProps {
  team: Team;
}

const ROLES: { value: TeamRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export function TeamMembers({ team }: TeamMembersProps) {
  const { updateMemberRole, removeMember } = useTeamStore();
  const [isInviting, setIsInviting] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const getRoleBadgeVariant = (role: TeamRole) => {
    switch (role) {
      case "owner":
        return "destructive";
      case "admin":
        return "warning";
      case "member":
        return "default";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-4 bg-muted/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>
        <Button onClick={() => setIsInviting(true)}>Invite Member</Button>
      </div>

      <div className="space-y-4">
        {team.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-background rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  {member.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(member.joined_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ROLES.map((role) => (
                    <DropdownMenuItem
                      key={role.value}
                      disabled={
                        member.role === "owner" ||
                        role.value === member.role ||
                        role.value === "owner"
                      }
                      onClick={() => updateMemberRole(team.id, member.id, role.value)}
                    >
                      Make {role.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setEditingMember(member.id)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Edit Permissions
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={member.role === "owner"}
                    onClick={() => removeMember(team.id, member.id)}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <InviteMember
        team={team}
        open={isInviting}
        onOpenChange={setIsInviting}
      />

      {editingMember && (
        <EditPermissions
          team={team}
          memberId={editingMember}
          open={true}
          onOpenChange={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
