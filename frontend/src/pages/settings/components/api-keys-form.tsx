import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, MoreHorizontal, Plus, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const apiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    key: "log_prod_xxxxxxxxxxxx",
    created: "2024-02-15",
    lastUsed: "2024-02-16",
    status: "active",
  },
  {
    id: "key_2",
    name: "Development API Key",
    key: "log_dev_xxxxxxxxxxxx",
    created: "2024-02-10",
    lastUsed: "2024-02-15",
    status: "active",
  },
  {
    id: "key_3",
    name: "Testing API Key",
    key: "log_test_xxxxxxxxxxxx",
    created: "2024-01-20",
    lastUsed: "2024-02-01",
    status: "revoked",
  },
];

export function ApiKeysForm() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  // const deleteKey = () => {
  //   toast.success("API key revoked successfully");
  // };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for accessing the Logify API.
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {apiKey.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.created}</TableCell>
                  <TableCell>{apiKey.lastUsed}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        apiKey.status === "active" ? "default" : "secondary"
                      }
                    >
                      {apiKey.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          // onClick={() => deleteKey(apiKey.id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
          <CardDescription>
            Learn how to use your API keys securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Use your API key in the Authorization header:
            </p>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Security</h4>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              <li>Never share your API keys in public repositories</li>
              <li>Rotate your keys periodically for enhanced security</li>
              <li>Use different keys for development and production</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
