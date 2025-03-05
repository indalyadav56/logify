import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, HelpCircle, Copy, Save } from "lucide-react";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CloudWatchQueryInputProps {
  onRunQuery: (query: string) => void;
  isLoading: boolean;
}

export function CloudWatchQueryInput({ onRunQuery, isLoading }: CloudWatchQueryInputProps) {
  const [query, setQuery] = useState('');
  const [savedQueries, setSavedQueries] = useState<{ id: string; name: string; query: string }[]>([]);
  const [showSavedQueries, setShowSavedQueries] = useState(false);

  // Load saved queries from local storage
  useEffect(() => {
    const saved = localStorage.getItem('logify-saved-queries');
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
  }, []);

  const handleRunQuery = () => {
    if (!query.trim()) {
      toast.error('Query cannot be empty');
      return;
    }
    onRunQuery(query);
  };

  const handleSaveQuery = () => {
    if (!query.trim()) {
      toast.error('Query cannot be empty');
      return;
    }

    const name = prompt('Enter a name for this query:');
    if (!name) return;

    const newQuery = {
      id: Date.now().toString(),
      name,
      query,
    };

    const updatedQueries = [...savedQueries, newQuery];
    setSavedQueries(updatedQueries);
    localStorage.setItem('logify-saved-queries', JSON.stringify(updatedQueries));
    toast.success('Query saved successfully');
  };

  const handleLoadQuery = (savedQuery: string) => {
    setQuery(savedQuery);
    setShowSavedQueries(false);
  };

  const handleDeleteQuery = (id: string) => {
    const updatedQueries = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updatedQueries);
    localStorage.setItem('logify-saved-queries', JSON.stringify(updatedQueries));
    toast.success('Query deleted');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">CloudWatch Query</h3>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Query Syntax Help</h4>
                <div className="text-xs space-y-1">
                  <p><Badge variant="outline">fields</Badge> - Select specific fields: <code>fields @timestamp, @message</code></p>
                  <p><Badge variant="outline">filter</Badge> - Filter logs: <code>filter level = "ERROR"</code></p>
                  <p><Badge variant="outline">stats</Badge> - Aggregate data: <code>stats count(*) by level</code></p>
                  <p><Badge variant="outline">sort</Badge> - Sort results: <code>sort @timestamp desc</code></p>
                  <p><Badge variant="outline">limit</Badge> - Limit results: <code>limit 20</code></p>
                  <p><Badge variant="outline">parse</Badge> - Extract fields: <code>parse @message "user: *" as user</code></p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: <code>fields @timestamp, level, message | filter level = "ERROR" | sort @timestamp desc | limit 20</code>
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showSavedQueries} onOpenChange={setShowSavedQueries}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Saved Queries
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Saved Queries</DialogTitle>
                <DialogDescription>
                  Select a saved query to load it into the editor
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[300px] mt-4">
                {savedQueries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved queries yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedQueries.map((savedQuery) => (
                      <div 
                        key={savedQuery.id} 
                        className="border rounded-md p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{savedQuery.name}</h4>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleLoadQuery(savedQuery.query)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleDeleteQuery(savedQuery.id)}
                            >
                              <span className="sr-only">Delete</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </Button>
                          </div>
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {savedQuery.query}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="relative">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter CloudWatch query (e.g., fields @timestamp, level, message | filter level = 'ERROR' | sort @timestamp desc)"
          className="min-h-[100px] font-mono text-sm"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveQuery}
            disabled={!query.trim() || isLoading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button
            onClick={handleRunQuery}
            disabled={!query.trim() || isLoading}
            className="h-8"
          >
            <Play className="h-4 w-4 mr-1" />
            Run Query
          </Button>
        </div>
      </div>
    </div>
  );
}
