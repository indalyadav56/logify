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
  BookOpen,
  FileText,
  Search,
  Plus,
  Settings,
  ThumbsUp,
  MessageSquare,
  History,
  Tags,
  Users,
  Star,
  Eye,
  Clock,
  Edit,
  Bookmark,
  Share2,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  status: 'published' | 'draft' | 'review';
  visibility: 'public' | 'team' | 'private';
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  lastUpdated: string;
  version: string;
  contributors: {
    name: string;
    avatar: string;
    role: string;
  }[];
  related: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
}

interface Comment {
  id: string;
  articleId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
}

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample articles
  const articles: Article[] = [
    {
      id: '1',
      title: 'Getting Started with Logging Best Practices',
      description: 'Learn about logging best practices and implementation guidelines',
      content: 'Comprehensive guide about logging...',
      category: 'guides',
      tags: ['logging', 'best-practices', 'setup'],
      author: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
      },
      status: 'published',
      visibility: 'public',
      metrics: {
        views: 1250,
        likes: 45,
        comments: 8,
        shares: 12,
      },
      lastUpdated: '2025-01-30',
      version: '2.1.0',
      contributors: [
        {
          name: 'Jane Smith',
          avatar: '/avatars/jane.jpg',
          role: 'editor',
        },
        {
          name: 'Mike Johnson',
          avatar: '/avatars/mike.jpg',
          role: 'reviewer',
        },
      ],
      related: ['2', '3'],
    },
    {
      id: '2',
      title: 'Advanced Log Analysis Techniques',
      description: 'Deep dive into log analysis and troubleshooting',
      content: 'Advanced techniques for log analysis...',
      category: 'tutorials',
      tags: ['analysis', 'troubleshooting', 'advanced'],
      author: {
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg',
      },
      status: 'published',
      visibility: 'team',
      metrics: {
        views: 850,
        likes: 32,
        comments: 15,
        shares: 8,
      },
      lastUpdated: '2025-01-25',
      version: '1.5.0',
      contributors: [
        {
          name: 'John Doe',
          avatar: '/avatars/john.jpg',
          role: 'reviewer',
        },
      ],
      related: ['1', '4'],
    },
  ];

  // Sample categories
  const categories: Category[] = [
    {
      id: 'guides',
      name: 'Guides',
      description: 'Getting started and how-to guides',
      articleCount: 25,
      icon: 'BookOpen',
    },
    {
      id: 'tutorials',
      name: 'Tutorials',
      description: 'Step-by-step tutorials and walkthroughs',
      articleCount: 18,
      icon: 'FileText',
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      articleCount: 32,
      icon: 'Search',
    },
  ];

  // Sample comments
  const comments: Comment[] = [
    {
      id: 'c1',
      articleId: '1',
      author: {
        name: 'Alice Cooper',
        avatar: '/avatars/alice.jpg',
      },
      content: 'Great article! Very helpful for setting up logging.',
      timestamp: '2025-01-31T05:45:00',
      likes: 5,
      replies: 2,
    },
    {
      id: 'c2',
      articleId: '1',
      author: {
        name: 'Bob Wilson',
        avatar: '/avatars/bob.jpg',
      },
      content: 'Could you add more examples for custom log formats?',
      timestamp: '2025-01-31T04:30:00',
      likes: 3,
      replies: 1,
    },
  ];

  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-50 text-green-700';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700';
      case 'review':
        return 'bg-blue-50 text-blue-700';
      default:
        return '';
    }
  };

  const getVisibilityColor = (visibility: Article['visibility']) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-50 text-green-700';
      case 'team':
        return 'bg-blue-50 text-blue-700';
      case 'private':
        return 'bg-gray-50 text-gray-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Documentation, guides, and best practices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{category.articleCount} articles</span>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{article.title}</h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(article.status)}
                    >
                      {article.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getVisibilityColor(article.visibility)}
                    >
                      {article.visibility}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{article.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Article Metrics */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{article.metrics.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{article.metrics.likes} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {article.metrics.comments} comments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{article.metrics.shares} shares</span>
                </div>
              </div>

              {/* Article Contributors */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Contributors</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10" />
                    <div>
                      <p className="text-sm font-medium">{article.author.name}</p>
                      <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                  </div>
                  {article.contributors.map((contributor) => (
                    <div key={contributor.name} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10" />
                      <div>
                        <p className="text-sm font-medium">{contributor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contributor.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Comments */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Recent Comments</h4>
                <div className="space-y-4">
                  {comments
                    .filter((comment) => comment.articleId === article.id)
                    .map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 bg-muted rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10" />
                            <div>
                              <p className="text-sm font-medium">
                                {comment.author.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {comment.replies}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Article Footer */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {article.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <span>Version {article.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Featured Article</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
