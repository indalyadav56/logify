import { useEffect } from "react";
import { useDocsStore } from "@/store/useDocsStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface DocContentProps {
  category: string;
}

export function DocContent({ category }: DocContentProps) {
  const { currentSection, fetchSection, isLoading, error } = useDocsStore();

  useEffect(() => {
    if (category) {
      fetchSection(category);
    }
  }, [category, fetchSection]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!currentSection) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No documentation found</AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{currentSection.title}</h1>
          {currentSection.description && (
            <p className="text-muted-foreground">{currentSection.description}</p>
          )}
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {currentSection.content}
          </ReactMarkdown>
        </div>

        {/* Related Links */}
        <div className="border-t pt-8">
          <h3 className="font-medium mb-4">Related Resources</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer">
              Quick Start Guide
            </Badge>
            <Badge variant="secondary" className="cursor-pointer">
              API Reference
            </Badge>
            <Badge variant="secondary" className="cursor-pointer">
              SDK Documentation
            </Badge>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
