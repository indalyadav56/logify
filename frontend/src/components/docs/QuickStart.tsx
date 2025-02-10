import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Copy } from 'lucide-react';

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
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

const QuickStart = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quick Start Guide</h1>
        <p className="text-muted-foreground">
          Get started with Logify in under 5 minutes
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* Installation */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <Tabs defaultValue="python">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
              <TabsTrigger value="java">Java</TabsTrigger>
            </TabsList>
            <TabsContent value="python">
              <CodeBlock 
                language="bash"
                code="pip install logify-sdk"
              />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeBlock 
                language="bash"
                code="npm install @logify/sdk"
              />
            </TabsContent>
            <TabsContent value="go">
              <CodeBlock 
                language="bash"
                code="go get github.com/logify/sdk-go"
              />
            </TabsContent>
            <TabsContent value="java">
              <CodeBlock 
                language="xml"
                code={`<dependency>
  <groupId>com.logify</groupId>
  <artifactId>logify-sdk</artifactId>
  <version>1.1.0</version>
</dependency>`}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Configuration */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
          <Tabs defaultValue="python">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
              <TabsTrigger value="java">Java</TabsTrigger>
            </TabsList>
            <TabsContent value="python">
              <CodeBlock 
                language="python"
                code={`from logify import Logify

# Initialize the client
logify = Logify(
    api_key="your-api-key",
    environment="production"
)`}
              />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeBlock 
                language="javascript"
                code={`import { Logify } from '@logify/sdk';

// Initialize the client
const logify = new Logify({
  apiKey: 'your-api-key',
  environment: 'production'
});`}
              />
            </TabsContent>
            <TabsContent value="go">
              <CodeBlock 
                language="go"
                code={`package main

import "github.com/logify/sdk-go"

func main() {
    client := logify.New(logify.Config{
        APIKey: "your-api-key",
        Environment: "production",
    })
}`}
              />
            </TabsContent>
            <TabsContent value="java">
              <CodeBlock 
                language="java"
                code={`import com.logify.LogifyClient;

public class Example {
    public static void main(String[] args) {
        LogifyClient client = new LogifyClient.Builder()
            .apiKey("your-api-key")
            .environment("production")
            .build();
    }
}`}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <Tabs defaultValue="python">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
              <TabsTrigger value="java">Java</TabsTrigger>
            </TabsList>
            <TabsContent value="python">
              <CodeBlock 
                language="python"
                code={`# Send logs
logify.log.info("User logged in", {
    "user_id": "123",
    "ip_address": "192.168.1.1"
})

# Track metrics
logify.metric.increment("login_count")

# Handle errors
try:
    # Your code
except Exception as e:
    logify.error.capture(e)`}
              />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeBlock 
                language="javascript"
                code={`// Send logs
logify.log.info('API request received', {
  method: 'GET',
  path: '/api/users',
  duration: 45
});

// Track metrics
logify.metric.increment('api_calls');

// Handle errors
try {
  // Your code
} catch (error) {
  logify.error.capture(error);
}`}
              />
            </TabsContent>
            <TabsContent value="go">
              <CodeBlock 
                language="go"
                code={`// Send logs
client.Log.Info("Server started", logify.Fields{
    "environment": "production",
    "version": "1.0.0",
})

// Track metrics
client.Metric.Increment("server_starts")

// Handle errors
defer client.Error.Recover()`}
              />
            </TabsContent>
            <TabsContent value="java">
              <CodeBlock 
                language="java"
                code={`// Send logs
client.log(LogLevel.INFO, "Application started", 
    Map.of("env", "production")
);

// Track metrics
client.trackMetric("app_starts", 1);

// Handle errors
try {
    // Your code
} catch (Exception e) {
    client.captureException(e);
}`}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <div className="grid gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Explore Advanced Features</h3>
              <p className="text-muted-foreground mb-4">Learn about AI analytics, custom metrics, and more.</p>
              <Button variant="secondary">View Advanced Features</Button>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Set Up Integrations</h3>
              <p className="text-muted-foreground mb-4">Connect with AWS, Google Cloud, or Kubernetes.</p>
              <Button variant="secondary">View Integrations</Button>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Join Our Community</h3>
              <p className="text-muted-foreground mb-4">Get help, share ideas, and contribute to Logify.</p>
              <Button variant="secondary">Join Community</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuickStart;
