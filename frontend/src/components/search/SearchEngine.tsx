import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Settings,
  History,
  Star,
  Bookmark,
  Tag,
  Clock,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  User,
  File,
  Folder,
  FileText
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'log' | 'metric' | 'document' | 'user' | 'project';
  title: string;
  description: string;
  content: string;
  metadata: {
    author?: string;
    created: string;
    modified: string;
    size?: number;
    format?: string;
    tags: string[];
    relevance: number;
  };
  highlights: {
    field: string;
    snippet: string;
  }[];
}

interface SearchFacet {
  name: string;
  field: string;
  type: 'terms' | 'range' | 'date';
  values: {
    key: string;
    doc_count: number;
  }[];
}

interface SearchFilter {
  field: string;
  operator: 'must' | 'must_not' | 'should';
  value: unknown;
}

const SearchEngine = () => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [timeRange, setTimeRange] = useState('all');
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Sample search results
  const searchResults: SearchResult[] = [
    {
      id: '1',
      type: 'log',
      title: 'Error in Authentication Service',
      description: 'Failed login attempt detected',
      content: 'Multiple failed login attempts detected from IP 192.168.1.100',
      metadata: {
        author: 'System',
        created: '2025-01-31T06:30:00',
        modified: '2025-01-31T06:30:00',
        tags: ['security', 'auth', 'error'],
        relevance: 0.95,
      },
      highlights: [
        {
          field: 'content',
          snippet: 'Multiple <em>failed login</em> attempts detected',
        },
      ],
    },
    {
      id: '2',
      type: 'document',
      title: 'System Architecture Overview',
      description: 'Technical documentation of system architecture',
      content: 'Detailed overview of system components and their interactions',
      metadata: {
        author: 'John Doe',
        created: '2025-01-30T14:20:00',
        modified: '2025-01-31T05:45:00',
        size: 1500000,
        format: 'pdf',
        tags: ['documentation', 'architecture', 'technical'],
        relevance: 0.85,
      },
      highlights: [
        {
          field: 'content',
          snippet: 'Detailed overview of <em>system</em> components',
        },
      ],
    },
  ];

  // Sample facets
  const searchFacets: SearchFacet[] = [
    {
      name: 'Type',
      field: 'type',
      type: 'terms',
      values: [
        { key: 'log', doc_count: 150 },
        { key: 'document', doc_count: 75 },
        { key: 'metric', doc_count: 50 },
        { key: 'user', doc_count: 25 },
        { key: 'project', doc_count: 10 },
      ],
    },
    {
      name: 'Tags',
      field: 'metadata.tags',
      type: 'terms',
      values: [
        { key: 'security', doc_count: 100 },
        { key: 'performance', doc_count: 80 },
        { key: 'error', doc_count: 60 },
        { key: 'documentation', doc_count: 40 },
        { key: 'configuration', doc_count: 20 },
      ],
    },
  ];

  // Active filters
  const activeFilters: SearchFilter[] = [
    {
      field: 'type',
      operator: 'must',
      value: 'log',
    },
    {
      field: 'metadata.tags',
      operator: 'should',
      value: ['security', 'error'],
    },
  ];

  const getResultTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'log':
        return <History className="h-4 w-4" />;
      case 'metric':
        return <SlidersHorizontal className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'project':
        return <Folder className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Search</h1>
          <p className="text-muted-foreground">
            Search across logs, metrics, and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline">
            <Star className="mr-2 h-4 w-4" />
            Saved
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across your workspace..."
                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Select defaultValue={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="log">Logs</SelectItem>
                <SelectItem value="metric">Metrics</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.field}: {filter.value.toString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="grid grid-cols-12 gap-6">
        {/* Facets */}
        <div className="col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-6">
                {searchFacets.map((facet) => (
                  <div key={facet.field}>
                    <h3 className="font-medium mb-2">{facet.name}</h3>
                    <div className="space-y-2">
                      {facet.values.map((value) => (
                        <div
                          key={value.key}
                          className="flex items-center justify-between text-sm"
                        >
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            {value.key}
                          </label>
                          <span className="text-muted-foreground">
                            {value.doc_count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent & Saved Searches */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Recent Searches</h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span>{search}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Saved Searches</h3>
                  <div className="space-y-2">
                    {savedSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                          <span>{search}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="col-span-9">
          <Card>
            <CardContent className="p-4">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-muted-foreground">
                  {searchResults.length} results
                </div>
                <div className="flex items-center gap-4">
                  <Select defaultValue={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getResultTypeIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{result.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {result.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {Math.round(result.metadata.relevance * 100)}%
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Highlights */}
                        {result.highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className="mt-2 text-sm bg-muted/50 p-2 rounded"
                            dangerouslySetInnerHTML={{
                              __html: `...${highlight.snippet}...`,
                            }}
                          />
                        ))}

                        {/* Metadata */}
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          {result.metadata.author && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{result.metadata.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(
                                result.metadata.modified
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {result.metadata.size && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>
                                {(result.metadata.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            {result.metadata.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
