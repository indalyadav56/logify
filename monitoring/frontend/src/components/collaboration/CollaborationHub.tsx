import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Users,
  Calendar,
  Plus,
  Send,
  FileText,
  Link,
  Image as ImageIcon,
  Paperclip,
  ThumbsUp,
  MessageCircle,
  Edit,
  Share2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  thread?: {
    count: number;
    lastReply?: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  tags: string[];
  attachments: number;
  comments: number;
  watchers: {
    id: string;
    name: string;
    avatar?: string;
  }[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastEdited: string;
  tags: string[];
  shared: boolean;
  pinned: boolean;
}

const CollaborationHub = () => {
  const [newMessage, setNewMessage] = useState('');
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);

  // Sample chat messages
  const messages: ChatMessage[] = [
    {
      id: '1',
      userId: 'u1',
      user: {
        name: 'John Doe',
        avatar: 'https://github.com/shadcn.png',
      },
      content: 'I found an interesting pattern in the error logs from last night',
      timestamp: '2025-01-31T05:45:00',
      attachments: [
        {
          type: 'image',
          url: 'https://example.com/graph.png',
          name: 'Error Analysis Graph',
        },
      ],
      reactions: [
        {
          emoji: '👍',
          count: 3,
          users: ['u2', 'u3', 'u4'],
        },
      ],
      thread: {
        count: 2,
        lastReply: '2025-01-31T05:50:00',
      },
    },
    {
      id: '2',
      userId: 'u2',
      user: {
        name: 'Jane Smith',
      },
      content: 'Great catch! Let\'s set up an alert for this pattern.',
      timestamp: '2025-01-31T05:48:00',
      reactions: [
        {
          emoji: '🚀',
          count: 2,
          users: ['u1', 'u3'],
        },
      ],
    },
  ];

  // Sample tasks
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Implement Error Pattern Detection',
      description: 'Create ML model to detect error patterns in logs',
      status: 'in_progress',
      priority: 'high',
      assignee: {
        id: 'u1',
        name: 'John Doe',
        avatar: 'https://github.com/shadcn.png',
      },
      dueDate: '2025-02-07T00:00:00',
      tags: ['ml', 'errors', 'monitoring'],
      attachments: 2,
      comments: 5,
      watchers: [
        {
          id: 'u2',
          name: 'Jane Smith',
        },
        {
          id: 'u3',
          name: 'Bob Wilson',
        },
      ],
    },
    {
      id: '2',
      title: 'Update Alert System',
      description: 'Integrate new alert patterns with notification system',
      status: 'todo',
      priority: 'medium',
      assignee: {
        id: 'u2',
        name: 'Jane Smith',
      },
      dueDate: '2025-02-05T00:00:00',
      tags: ['alerts', 'notifications'],
      attachments: 1,
      comments: 3,
      watchers: [
        {
          id: 'u1',
          name: 'John Doe',
          avatar: 'https://github.com/shadcn.png',
        },
      ],
    },
  ];

  // Sample notes
  const notes: Note[] = [
    {
      id: '1',
      title: 'Error Pattern Analysis',
      content: 'Key findings from log analysis...',
      author: {
        id: 'u1',
        name: 'John Doe',
        avatar: 'https://github.com/shadcn.png',
      },
      lastEdited: '2025-01-31T05:30:00',
      tags: ['documentation', 'analysis'],
      shared: true,
      pinned: true,
    },
    {
      id: '2',
      title: 'Alert System Design',
      content: 'Proposed architecture for new alert system...',
      author: {
        id: 'u2',
        name: 'Jane Smith',
      },
      lastEdited: '2025-01-31T04:15:00',
      tags: ['design', 'alerts'],
      shared: true,
      pinned: false,
    },
  ];

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-50 text-gray-700';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700';
      case 'review':
        return 'bg-yellow-50 text-yellow-700';
      case 'done':
        return 'bg-green-50 text-green-700';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Collaboration Hub</h1>
          <p className="text-muted-foreground">
            Chat, collaborate, and manage tasks with your team
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Online Team
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Chat Area */}
        <div className="col-span-8 space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.avatar} />
                    <AvatarFallback>
                      {message.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.attachments && (
                      <div className="flex gap-2">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm"
                          >
                            {attachment.type === 'image' ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : attachment.type === 'file' ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <Link className="h-4 w-4" />
                            )}
                            <span>{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.reactions && (
                      <div className="flex gap-2">
                        {message.reactions.map((reaction, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-sm"
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.thread && (
                      <Button variant="ghost" className="text-sm">
                        View thread ({message.thread.count} replies)
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-4">
          {/* Tasks */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Tasks</h2>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(task.status)}
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback>
                          {task.assignee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{task.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-4 w-4" />
                        <span>{task.attachments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Shared Notes</h2>
                <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Note</DialogTitle>
                      <DialogDescription>
                        Create a new note to share with your team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Title</Label>
                        <Input placeholder="Note title" />
                      </div>
                      <div>
                        <Label>Content</Label>
                        <Textarea placeholder="Write your note..." />
                      </div>
                      <div>
                        <Label>Tags</Label>
                        <Input placeholder="Add tags separated by commas" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateNoteOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsCreateNoteOpen(false)}>
                        Create Note
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{note.title}</h3>
                          {note.pinned && (
                            <Badge variant="outline">Pinned</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={note.author.avatar} />
                            <AvatarFallback>
                              {note.author.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{note.author.name}</span>
                          <span>•</span>
                          <span>
                            {new Date(note.lastEdited).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
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

export default CollaborationHub;
