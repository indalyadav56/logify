import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Key,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
} from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
}

interface ProjectApiKeysProps {
  project: {
    id: string;
    name: string;
    api_keys?: ApiKey[];
  };
}

export function ProjectApiKeys({ project }: ProjectApiKeysProps) {
  // const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<ApiKey | null>(null);

  const handleCreateApiKey = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/v1/projects/${project.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: newKeyName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create API key");
      }

      const data = await response.json();
      setNewKey(data);
      setNewKeyName("");
    } catch (error) {
      console.error("Failed to create API key:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to create API key. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await fetch(
        `http://localhost:8080/v1/projects/${project.id}/api-keys/${keyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "API key deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // toast({
    //   title: "Copied!",
    //   description: "API key copied to clipboard",
    // });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for accessing your project programmatically
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key to access your project programmatically.
                  Make sure to copy your API key as it won't be shown again.
                </DialogDescription>
              </DialogHeader>
              {newKey ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your API key has been created. Make sure to copy it now as it
                      won't be shown again.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-muted rounded-md">
                        {newKey.key}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyApiKey(newKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key Name</label>
                    <Input
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                {newKey ? (
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Done
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateApiKey}>Create Key</Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.api_keys?.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span>{apiKey.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(apiKey.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {apiKey.last_used ? (
                    new Date(apiKey.last_used).toLocaleDateString()
                  ) : (
                    <Badge variant="outline">Never</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyApiKey(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
