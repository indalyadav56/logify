import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkList } from "./components/bookmark-list";
import { BookmarkGrid } from "./components/bookmark-grid";
import { BookmarkFolders } from "./components/bookmark-folders";
import { CreateBookmark } from "./components/create-bookmark";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { folders } = useBookmarkStore();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookmarks</h2>
          <p className="text-muted-foreground">
            Manage and organize your saved log queries.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Bookmark
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="md:w-64">
          <CardHeader>
            <CardTitle>Folders</CardTitle>
          </CardHeader>
          <CardContent>
            <BookmarkFolders />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Saved Bookmarks</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-60">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bookmarks..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        {view === "grid" ? (
                          <Grid className="h-4 w-4" />
                        ) : (
                          <List className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setView("grid")}>
                        <Grid className="mr-2 h-4 w-4" /> Grid View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setView("list")}>
                        <List className="mr-2 h-4 w-4" /> List View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {view === "grid" ? <BookmarkGrid /> : <BookmarkList />}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateBookmark
        open={isCreating}
        onOpenChange={setIsCreating}
      />
    </div>
  );
}
