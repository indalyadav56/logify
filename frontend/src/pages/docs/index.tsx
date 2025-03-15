import { useEffect, useState } from "react";
import { useDocsStore } from "@/store/useDocsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  BookOpen,
  Code2,
  FileCode2,
  Rocket,
  Search,
  Terminal,
} from "lucide-react";
import { DocContent } from "./components/doc-content";
import { SearchResults } from "./components/search-results";
import { SDKSection } from "./components/sdk-section";

export default function DocsPage() {
  const { categories, fetchCategories, searchDocs } = useDocsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const results = await searchDocs(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "getting-started":
        return <Rocket className="h-5 w-5" />;
      case "guides":
        return <Book className="h-5 w-5" />;
      case "api-reference":
        return <Code2 className="h-5 w-5" />;
      case "sdks":
        return <Terminal className="h-5 w-5" />;
      case "examples":
        return <FileCode2 className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to integrate and use Logify in your applications
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {searchQuery.length >= 3 ? (
        <SearchResults results={searchResults} />
      ) : (
        <div className="grid gap-6">
          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="cursor-pointer hover:bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Get up and running in under 5 minutes
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  SDKs
                </CardTitle>
                <CardDescription>
                  Official SDKs for various languages
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Complete API documentation
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5" />
                  Examples
                </CardTitle>
                <CardDescription>
                  Sample code and implementations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 md:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <h3 className="font-medium flex items-center gap-2">
                          {getCategoryIcon(category.id)}
                          {category.title}
                        </h3>
                        <div className="ml-7 space-y-1">
                          {category.sections.map((section) => (
                            <Button
                              key={section.id}
                              variant="ghost"
                              className="w-full justify-start text-sm"
                              onClick={() => setSelectedCategory(section.id)}
                            >
                              {section.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="getting-started">
                      Getting Started
                    </TabsTrigger>
                    <TabsTrigger value="guides">Guides</TabsTrigger>
                    <TabsTrigger value="api-reference">API Reference</TabsTrigger>
                    <TabsTrigger value="sdks">SDKs</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>

                  <TabsContent value="getting-started">
                    <DocContent category="getting-started" />
                  </TabsContent>
                  <TabsContent value="guides">
                    <DocContent category="guides" />
                  </TabsContent>
                  <TabsContent value="api-reference">
                    <DocContent category="api-reference" />
                  </TabsContent>
                  <TabsContent value="sdks">
                    <SDKSection />
                  </TabsContent>
                  <TabsContent value="examples">
                    <DocContent category="examples" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
