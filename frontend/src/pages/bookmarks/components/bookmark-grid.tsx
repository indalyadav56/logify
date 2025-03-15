import { useBookmarkStore } from "@/store/useBookmarkStore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Clock, Edit, MoreHorizontal, Star, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BookmarkGrid() {
  const { bookmarks, toggleFavorite, deleteBookmark } = useBookmarkStore();

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="group">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base line-clamp-1">
                  {bookmark.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(bookmark.id)}
                  >
                    <Star
                      className={bookmark.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}
                      size={16}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bookmark className="mr-2 h-4 w-4" /> Move to Folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteBookmark(bookmark.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {bookmark.description || "No description provided"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {bookmark.query.level?.map((level) => (
                    <Badge key={level} variant="secondary">
                      {level}
                    </Badge>
                  ))}
                  {bookmark.query.service && (
                    <Badge variant="outline">{bookmark.query.service}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Updated {formatDistanceToNow(new Date(bookmark.updated_at), { addSuffix: true })}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
