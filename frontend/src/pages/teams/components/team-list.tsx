import { useTeamStore, Team } from "@/store/useTeamStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Settings, Trash, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { TeamMembers } from "./team-members";
import { TeamSettings } from "./team-settings";

interface TeamListProps {
  type: "active" | "pending";
  searchQuery: string;
}

export function TeamList({ type, searchQuery }: TeamListProps) {
  const { teams, deleteTeam } = useTeamStore();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  // const navigate = useNavigate();
  console.log(type);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMembers = (team: Team) => {
    setSelectedTeam(selectedTeam === team.id ? null : team.id);
    setShowSettings(false);
  };

  const handleViewSettings = (team: Team) => {
    setSelectedTeam(selectedTeam === team.id ? null : team.id);
    setShowSettings(true);
  };

  // const getRoleColor = (role: TeamRole) => {
  //   switch (role) {
  //     case "owner":
  //       return "destructive";
  //     case "admin":
  //       return "warning";
  //     default:
  //       return "secondary";
  //   }
  // };

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeams.map((team) => (
            <>
              <TableRow key={team.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {team.description}
                    </div>
                  </div>
                </TableCell>
                {/* <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{team.members.length}</span>
                    {team.members.slice(0, 3).map((member) => (
                      <Badge
                        key={member.id}
                        // variant={getRoleColor(member.role)}
                      >
                        {member.role}
                      </Badge>
                    ))}
                    {team.members.length > 3 && (
                      <Badge variant="outline">
                        +{team.members.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {team.projects.length} projects
                  </Badge>
                </TableCell> */}
                <TableCell>
                  {/* {formatDistanceToNow(new Date(team.created_at), {
                    addSuffix: true,
                  })} */}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewMembers(team)}>
                        <Users className="mr-2 h-4 w-4" /> View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewSettings(team)}
                      >
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteTeam(team.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {selectedTeam === team.id && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    {showSettings ? (
                      <TeamSettings team={team} />
                    ) : (
                      <TeamMembers team={team} />
                    )}
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
