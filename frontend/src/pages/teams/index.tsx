import { useTeamStore } from "@/store/useTeamStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { TeamList } from "./components/team-list";
import { CreateTeam } from "./components/create-team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">
            Manage your teams and team members.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Teams</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-60">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="my-teams" className="space-y-4">
              <TabsList>
                <TabsTrigger value="my-teams">My Teams</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
              </TabsList>

              <TabsContent value="my-teams" className="space-y-4">
                <TeamList
                  type="active"
                  searchQuery={searchQuery}
                />
              </TabsContent>

              <TabsContent value="invitations" className="space-y-4">
                <TeamList
                  type="pending"
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CreateTeam
        open={isCreating}
        onOpenChange={setIsCreating}
      />
    </div>
  );
}
