import { useState } from "react";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  logId: string;
  initialName?: string;
  className?: string;
}

export function BookmarkButton({
  logId,
  initialName = "",
  className,
}: BookmarkButtonProps) {
  const { addBookmark, folders, isLoading } = useBookmarkStore();
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const handleBookmark = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the bookmark");
      return;
    }

    try {
      await addBookmark({
        log_id: logId,
        name: name.trim(),
        description: description.trim(),
        folder: selectedFolder,
        is_favorite: false,
        query: {},
      });
      toast.success("Log bookmarked successfully");
      setShowDialog(false);
    } catch (error) {
      toast.error("Failed to bookmark log");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setShowDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Bookmark</DialogTitle>
            <DialogDescription>
              Save this log for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter bookmark name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Folder (Optional)</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookmark} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Bookmark"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
