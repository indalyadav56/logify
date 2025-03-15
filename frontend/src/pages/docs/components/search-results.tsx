import { DocSection } from "@/store/useDocsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Book,
  Code2,
  FileCode2,
  Rocket,
  Terminal,
} from "lucide-react";

interface SearchResultsProps {
  results: DocSection[];
}

export function SearchResults({ results }: SearchResultsProps) {
  const getCategoryIcon = (category: DocSection["category"]) => {
    switch (category) {
      case "getting-started":
        return <Rocket className="h-4 w-4" />;
      case "guides":
        return <Book className="h-4 w-4" />;
      case "api-reference":
        return <Code2 className="h-4 w-4" />;
      case "sdks":
        return <Terminal className="h-4 w-4" />;
      case "examples":
        return <FileCode2 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: DocSection["category"]) => {
    switch (category) {
      case "getting-started":
        return "bg-blue-500";
      case "guides":
        return "bg-green-500";
      case "api-reference":
        return "bg-purple-500";
      case "sdks":
        return "bg-yellow-500";
      case "examples":
        return "bg-pink-500";
    }
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No results found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="cursor-pointer hover:bg-accent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(result.category)}
                    {result.title}
                  </CardTitle>
                  {result.description && (
                    <CardDescription>{result.description}</CardDescription>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`${getCategoryColor(
                    result.category
                  )} text-white border-0`}
                >
                  {result.category.split("-").join(" ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
