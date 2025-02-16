import { useBookmarkStore } from "@/store/useBookmarkStore";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateBookmarkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const logLevels = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

export function CreateBookmark({ open, onOpenChange }: CreateBookmarkProps) {
  const { addBookmark, folders } = useBookmarkStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [service, setService] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [folder, setFolder] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      addBookmark({
        name: name.trim(),
        description,
        query: {
          service: service.trim(),
          level: selectedLevels,
          timeRange: {
            from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          },
        },
        folder: folder || undefined,
        is_favorite: false,
      });
      handleReset();
    }
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setService("");
    setSelectedLevels([]);
    setFolder("");
    onOpenChange(false);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Bookmark</DialogTitle>
          <DialogDescription>
            Save your log query for quick access later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bookmark name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter bookmark description"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service">Service</Label>
            <Input
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Enter service name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Log Levels</Label>
            <div className="flex flex-wrap gap-2">
              {logLevels.map((level) => (
                <Badge
                  key={level}
                  variant={selectedLevels.includes(level) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLevel(level)}
                >
                  {level}
                  {selectedLevels.includes(level) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Bookmark</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
