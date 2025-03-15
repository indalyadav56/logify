import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Github,
  Terminal,
  PackageCheck,
  Coffee,
  Book,
} from "lucide-react";

const sdks = [
  {
    id: "node",
    name: "Node.js",
    description: "Official Node.js SDK for Logify",
    version: "1.0.0",
    status: "stable",
    installCommand: "npm install @logify/node",
    githubUrl: "https://github.com/logify/node-sdk",
    docsUrl: "https://docs.logify.io/sdks/node",
    language: "JavaScript",
  },
  {
    id: "python",
    name: "Python",
    description: "Official Python SDK for Logify",
    version: "1.0.0",
    status: "stable",
    installCommand: "pip install logify",
    githubUrl: "https://github.com/logify/python-sdk",
    docsUrl: "https://docs.logify.io/sdks/python",
    language: "Python",
  },
  {
    id: "java",
    name: "Java",
    description: "Official Java SDK for Logify",
    version: "1.0.0",
    status: "beta",
    installCommand: "maven install logify",
    githubUrl: "https://github.com/logify/java-sdk",
    docsUrl: "https://docs.logify.io/sdks/java",
    language: "Java",
  },
  {
    id: "go",
    name: "Go",
    description: "Official Go SDK for Logify",
    version: "1.0.0",
    status: "stable",
    installCommand: "go get github.com/logify/go-sdk",
    githubUrl: "https://github.com/logify/go-sdk",
    docsUrl: "https://docs.logify.io/sdks/go",
    language: "Go",
  },
];

export function SDKSection() {
  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Official SDKs</h2>
        <p className="text-muted-foreground">
          Integrate Logify into your applications using our official SDKs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sdks.map((sdk) => (
          <Card key={sdk.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    {sdk.name}
                  </CardTitle>
                  <CardDescription>{sdk.description}</CardDescription>
                </div>
                <Badge
                  variant={sdk.status === "stable" ? "default" : "secondary"}
                >
                  {sdk.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
                <span>Version {sdk.version}</span>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <pre className="bg-muted p-2 rounded-md text-sm font-mono">
                    {sdk.installCommand}
                  </pre>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1.5"
                          onClick={() => handleCopyCommand(sdk.installCommand)}
                        >
                          <Coffee className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy install command</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={sdk.githubUrl} target="_blank" rel="noopener">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={sdk.docsUrl} target="_blank" rel="noopener">
                    <Book className="mr-2 h-4 w-4" />
                    Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community SDKs */}
      <div className="space-y-4 mt-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Community SDKs</h2>
          <p className="text-muted-foreground">
            SDKs created and maintained by the community
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Terminal className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">Build a Community SDK</h3>
                <p className="text-sm text-muted-foreground">
                  Help the community by creating an SDK for your favorite language
                </p>
              </div>
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" />
                View SDK Guidelines
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
