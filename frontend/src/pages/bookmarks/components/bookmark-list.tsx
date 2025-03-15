import { useBookmarkStore } from "@/store/useBookmarkStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bookmark, Edit, MoreHorizontal, Star, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BookmarkList() {
  const { bookmarks, toggleFavorite, deleteBookmark } = useBookmarkStore();

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Levels</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookmarks.map((bookmark) => (
            <TableRow key={bookmark.id}>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{bookmark.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {bookmark.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {bookmark.query.service && (
                  <Badge variant="outline">{bookmark.query.service}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {bookmark.query.level?.map((level) => (
                    <Badge key={level} variant="secondary">
                      {level}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(bookmark.updated_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
