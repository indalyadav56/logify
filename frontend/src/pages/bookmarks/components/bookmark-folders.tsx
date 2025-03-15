import { useBookmarkStore } from "@/store/useBookmarkStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Folder, FolderPlus, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function BookmarkFolders() {
  const { folders, addFolder } = useBookmarkStore();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            selectedFolder === "favorites" && "bg-muted"
          )}
          onClick={() => setSelectedFolder("favorites")}
        >
          <Star className="mr-2 h-4 w-4 text-yellow-400" />
          Favorites
        </Button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between py-2">
          <h4 className="text-sm font-medium">Folders</h4>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for your new bookmark folder.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Folder name</Label>
                  <Input
                    id="name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                selectedFolder === folder && "bg-muted"
              )}
              onClick={() => setSelectedFolder(folder)}
            >
              <Folder className="mr-2 h-4 w-4" />
              {folder}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
