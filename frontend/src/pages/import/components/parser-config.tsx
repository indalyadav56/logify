import { useState } from "react";
import { ParserRule } from "@/lib/log-parser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Code,
  Settings2,
  FileJson,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParserConfigProps {
  onConfigChange: (config: any) => void;
}

const SAMPLE_LOGS = {
  nginx: '192.168.1.1 - - [10/Oct/2023:13:55:36 +0000] "GET /api/users HTTP/1.1" 200 1234',
  apache: '127.0.0.1 - frank [10/Oct/2023:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326',
  syslog: 'Aug 24 05:14:15 server-1 python3[1234]: Successfully processed 100 records',
  log4j: '2023-08-24 05:14:15,123 INFO [main] Processing started',
  custom: 'ERROR [2023-08-24T05:14:15.123Z]: Failed to connect to database - retry attempt 3',
};

export function ParserConfig({ onConfigChange }: ParserConfigProps) {
  const [customRules, setCustomRules] = useState<ParserRule[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("auto");
  const [activeTab, setActiveTab] = useState("basic");
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  const addCustomRule = () => {
    const newRule: ParserRule = {
      name: `Custom Rule ${customRules.length + 1}`,
      pattern: new RegExp(""),
      extract: (match) => ({
        level: "info",
        message: match[0],
      }),
    };
    setCustomRules([...customRules, newRule]);
    onConfigChange({ customRules: [...customRules, newRule] });
  };

  const updateRule = (index: number, updates: Partial<ParserRule>) => {
    const updatedRules = customRules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    );
    setCustomRules(updatedRules);
    onConfigChange({ customRules: updatedRules });
  };

  const removeRule = (index: number) => {
    const updatedRules = customRules.filter((_, i) => i !== index);
    setCustomRules(updatedRules);
    onConfigChange({ customRules: updatedRules });
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    setTestInput(SAMPLE_LOGS[format as keyof typeof SAMPLE_LOGS] || "");
  };

  const testParser = () => {
    try {
      // Simulate parsing result
      const result = {
        success: true,
        parsed: {
          level: "info",
          message: "Successfully parsed log entry",
          timestamp: new Date().toISOString(),
          service: "test-service",
          metadata: {},
        },
      };
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: (error as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <Settings2 className="h-4 w-4 mr-2" />
            Basic Settings
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Code className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="test">
            <FileJson className="h-4 w-4 mr-2" />
            Test Parser
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>
                Configure basic parser settings and formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Log Format</Label>
                  <Select value={selectedFormat} onValueChange={handleFormatChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="nginx">Nginx</SelectItem>
                      <SelectItem value="apache">Apache</SelectItem>
                      <SelectItem value="syslog">Syslog</SelectItem>
                      <SelectItem value="log4j">Log4j/Winston</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Timestamp Format</Label>
                  <Select defaultValue="iso8601">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso8601">ISO 8601</SelectItem>
                      <SelectItem value="unix">Unix Timestamp</SelectItem>
                      <SelectItem value="rfc3339">RFC 3339</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Parser Rules</CardTitle>
                  <CardDescription>
                    Create custom rules for parsing log formats
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addCustomRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <Accordion type="single" collapsible className="space-y-4">
                  {customRules.map((rule, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center space-x-2">
                          <span>{rule.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {rule.pattern.source}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="grid gap-2">
                            <Label>Rule Name</Label>
                            <Input
                              value={rule.name}
                              onChange={(e) =>
                                updateRule(index, { name: e.target.value })
                              }
                              placeholder="Enter rule name"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Pattern (RegEx)</Label>
                            <Textarea
                              value={rule.pattern.source}
                              onChange={(e) =>
                                updateRule(index, {
                                  pattern: new RegExp(e.target.value),
                                })
                              }
                              placeholder="Enter regex pattern"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Field Mapping</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Level Field</Label>
                                <Input placeholder="Group number or name" />
                              </div>
                              <div className="space-y-2">
                                <Label>Message Field</Label>
                                <Input placeholder="Group number or name" />
                              </div>
                              <div className="space-y-2">
                                <Label>Service Field</Label>
                                <Input placeholder="Group number or name" />
                              </div>
                              <div className="space-y-2">
                                <Label>Timestamp Field</Label>
                                <Input placeholder="Group number or name" />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeRule(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Rule
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Parser</CardTitle>
              <CardDescription>
                Test your parser configuration with sample logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Sample Log Entry</Label>
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Paste a sample log entry here"
                    rows={4}
                  />
                </div>

                <Button onClick={testParser}>Test Parser</Button>

                {testResult && (
                  <div className="space-y-4">
                    {testResult.success ? (
                      <>
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Successfully parsed log entry
                          </AlertDescription>
                        </Alert>
                        <Card>
                          <CardContent className="pt-6">
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                              {JSON.stringify(testResult.parsed, null, 2)}
                            </pre>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{testResult.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
