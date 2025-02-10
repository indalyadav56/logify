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
  File,
  Image,
  Video,
  Music,
  FileText,
  Upload,
  Download,
  Folder,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Lock,
  Eye,
  Copy,
  History,
  Star,
  Plus,
  Settings,
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  size: number;
  url: string;
  thumbnail?: string;
  metadata: {
    dimensions?: string;
    duration?: string;
    format: string;
    created: string;
    modified: string;
    owner: string;
  };
  tags: string[];
  visibility: 'public' | 'private' | 'shared';
  version: {
    current: string;
    history: {
      version: string;
      date: string;
      author: string;
    }[];
  };
  stats: {
    views: number;
    downloads: number;
    shares: number;
  };
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
}

interface AssetFolder {
  id: string;
  name: string;
  path: string;
  itemCount: number;
  size: number;
  created: string;
  modified: string;
  owner: string;
  shared: boolean;
}

interface AssetTag {
  id: string;
  name: string;
  color: string;
  assetCount: number;
}

const AssetManager = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');

  // Sample assets
  const assets: Asset[] = [
    {
      id: '1',
      name: 'product-screenshot.png',
      type: 'image',
      size: 2500000,
      url: '/assets/product-screenshot.png',
      thumbnail: '/assets/thumbnails/product-screenshot.png',
      metadata: {
        dimensions: '1920x1080',
        format: 'PNG',
        created: '2025-01-30T10:00:00',
        modified: '2025-01-31T06:15:00',
        owner: 'John Doe',
      },
      tags: ['screenshot', 'product', 'marketing'],
      visibility: 'public',
      version: {
        current: '1.2.0',
        history: [
          {
            version: '1.2.0',
            date: '2025-01-31T06:15:00',
            author: 'John Doe',
          },
          {
            version: '1.1.0',
            date: '2025-01-30T15:30:00',
            author: 'Jane Smith',
          },
        ],
      },
      stats: {
        views: 245,
        downloads: 52,
        shares: 18,
      },
      permissions: {
        canView: ['*'],
        canEdit: ['admin', 'editor'],
        canDelete: ['admin'],
      },
    },
    {
      id: '2',
      name: 'user-guide.pdf',
      type: 'document',
      size: 5800000,
      url: '/assets/user-guide.pdf',
      metadata: {
        format: 'PDF',
        created: '2025-01-29T14:30:00',
        modified: '2025-01-31T05:45:00',
        owner: 'Jane Smith',
      },
      tags: ['documentation', 'guide', 'user'],
      visibility: 'private',
      version: {
        current: '2.0.0',
        history: [
          {
            version: '2.0.0',
            date: '2025-01-31T05:45:00',
            author: 'Jane Smith',
          },
        ],
      },
      stats: {
        views: 125,
        downloads: 45,
        shares: 8,
      },
      permissions: {
        canView: ['team'],
        canEdit: ['admin', 'editor'],
        canDelete: ['admin'],
      },
    },
  ];

  // Sample folders
  const folders: AssetFolder[] = [
    {
      id: '1',
      name: 'Marketing Assets',
      path: '/marketing',
      itemCount: 156,
      size: 2500000000,
      created: '2025-01-15T10:00:00',
      modified: '2025-01-31T06:00:00',
      owner: 'Marketing Team',
      shared: true,
    },
    {
      id: '2',
      name: 'Product Documentation',
      path: '/docs',
      itemCount: 89,
      size: 1800000000,
      created: '2025-01-20T14:30:00',
      modified: '2025-01-31T05:45:00',
      owner: 'Documentation Team',
      shared: true,
    },
  ];

  // Sample tags
  const tags: AssetTag[] = [
    {
      id: '1',
      name: 'marketing',
      color: '#10B981',
      assetCount: 45,
    },
    {
      id: '2',
      name: 'documentation',
      color: '#3B82F6',
      assetCount: 32,
    },
    {
      id: '3',
      name: 'product',
      color: '#8B5CF6',
      assetCount: 28,
    },
  ];

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Asset Manager</h1>
          <p className="text-muted-foreground">
            Manage and organize your files and media
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="pl-8 h-9 w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Select defaultValue={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* Folders */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-medium mb-4">Folders</h2>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-muted ${
                      selectedFolder === folder.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{folder.name}</span>
                      </div>
                      {folder.shared && (
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{folder.itemCount} items</span>
                      <span>{formatFileSize(folder.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Tags</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tag.assetCount}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardContent className="p-4">
                    <div className="aspect-square mb-4 bg-muted rounded-lg flex items-center justify-center">
                      {asset.thumbnail ? (
                        <img
                          src={asset.thumbnail}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="p-8 bg-primary/10 rounded-lg">
                          {getAssetIcon(asset.type)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium truncate">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(asset.size)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {asset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{asset.stats.views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>{asset.stats.downloads}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          <span>{asset.stats.shares}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(asset.size)}</span>
                            <span>•</span>
                            <span>
                              {new Date(
                                asset.metadata.modified
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetManager;
