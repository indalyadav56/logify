import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Terminal, Download, BookOpen, Github } from "lucide-react";

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  console.log("language", language);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="relative">
      <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={copyToClipboard}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SDKSection = () => {
  const sdks = {
    python: {
      installation: "pip install logify-sdk",
      example: `from logify import Logify

# Initialize the client
logify = Logify(api_key="your-api-key")

# Send logs
logify.log.info("User logged in", {
    "user_id": "123",
    "ip_address": "192.168.1.1"
})

# Send metrics
logify.metric.increment("login_count")

# Create custom dashboard
dashboard = logify.dashboard.create({
    "name": "User Activity",
    "metrics": ["login_count", "active_users"]
})`,
      version: "1.2.0",
      docs: "https://docs.logify.dev/python",
    },
    javascript: {
      installation: "npm install @logify/sdk",
      example: `import { Logify } from '@logify/sdk';

// Initialize the client
const logify = new Logify({
  apiKey: 'your-api-key'
});

// Send logs
logify.log.info('API request received', {
  method: 'GET',
  path: '/api/users',
  duration: 45
});

// Track errors
try {
  // Your code
} catch (error) {
  logify.error.capture(error);
}

// Real-time monitoring
logify.monitor.watch('memory_usage', {
  threshold: 90,
  callback: (metric) => {
    console.log('High memory usage detected:', metric);
  }
});`,
      version: "2.1.0",
      docs: "https://docs.logify.dev/javascript",
    },
    golang: {
      installation: "go get github.com/logify/sdk-go",
      example: `package main

import (
    "github.com/logify/sdk-go"
)

func main() {
    // Initialize client
    client := logify.New(logify.Config{
        APIKey: "your-api-key",
    })

    // Send logs
    client.Log.Info("Server started", logify.Fields{
        "environment": "production",
        "version": "1.0.0",
    })

    // Error handling
    defer client.Error.Recover()

    // Custom metrics
    client.Metric.Gauge("server_memory", 1024)
}`,
      version: "1.0.1",
      docs: "https://docs.logify.dev/golang",
    },
    java: {
      installation: `<dependency>
  <groupId>com.logify</groupId>
  <artifactId>logify-sdk</artifactId>
  <version>1.1.0</version>
</dependency>`,
      example: `import com.logify.LogifyClient;
import com.logify.LogLevel;

public class Example {
    public static void main(String[] args) {
        // Initialize client
        LogifyClient client = new LogifyClient("your-api-key");

        // Send logs
        client.log(LogLevel.INFO, "Application started", 
            Map.of("env", "production")
        );

        // Error tracking
        try {
            // Your code
        } catch (Exception e) {
            client.captureException(e);
        }

        // Custom metrics
        client.trackMetric("api_latency", 45.2);
    }
}`,
      version: "1.1.0",
      docs: "https://docs.logify.dev/java",
    },
  };

  return (
    <section className="py-20" id="sdks">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Powerful SDKs for Every Platform
          </h2>
          <p className="text-xl text-muted-foreground">
            Integrate Logify into your application with our easy-to-use SDKs
          </p>
        </div>

        <Tabs defaultValue="python" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="golang">Go</TabsTrigger>
            <TabsTrigger value="java">Java</TabsTrigger>
          </TabsList>

          {Object.entries(sdks).map(([lang, sdk]) => (
            <TabsContent key={lang} value={lang}>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Installation</CardTitle>
                      {/* <Badge variant="secondary">v{sdk.version}</Badge> */}
                    </div>
                    <CardDescription>
                      Get started with Logify in your {lang} application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={sdk.installation} language={lang} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Example</CardTitle>
                    <CardDescription>
                      See how easy it is to use Logify
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={sdk.example} language={lang} />
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button className="flex-1">
                    <Terminal className="mr-2 h-4 w-4" />
                    View Full Documentation
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Package Managers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Available on all major package managers. Easy installation with
                npm, pip, go get, and maven.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive documentation with examples, tutorials, and API
                references.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All SDKs are open source. Contribute, report issues, or
                customize for your needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SDKSection;
