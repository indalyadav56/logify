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
  BookTemplate,
  Server,
  Shield,
  Activity,
  Database,
  Cloud,
  Search,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: JSX.Element;
  pattern: string;
  webhookUrl: string;
  method: string;
  headers: Record<string, string>;
  payload: string;
  popularity: number;
  complexity: "simple" | "medium" | "advanced";
}

const WebhookTemplates = () => {
  const templates: Template[] = [
    {
      id: "1",
      name: "Service Auto-Scaling",
      description: "Automatically scale services based on load metrics",
      category: "Infrastructure",
      icon: <Server className="h-5 w-5" />,
      pattern: "cpu_usage > 80% OR memory_usage > 85% FOR 5m",
      webhookUrl: "https://api.kubernetes.io/v1/scale",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "${AUTH_TOKEN}",
      },
      payload: `{
  "service": "{{ service_name }}",
  "replicas": "{{ current_replicas + 1 }}",
  "metrics": {
    "cpu": "{{ cpu_usage }}",
    "memory": "{{ memory_usage }}"
  }
}`,
      popularity: 95,
      complexity: "advanced",
    },
    {
      id: "2",
      name: "Security Alert",
      description: "Send alerts for suspicious security events",
      category: "Security",
      icon: <Shield className="h-5 w-5" />,
      pattern:
        "event_type=AUTH_FAIL AND ip_address NOT IN allowed_ips COUNT > 5 WITHIN 5m",
      webhookUrl: "https://api.slack.com/webhooks/security",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      payload: `{
  "channel": "#security-alerts",
  "text": "🚨 Multiple failed login attempts detected",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Security Alert*\\nMultiple failed login attempts from IP: {{ ip_address }}"
      }
    }
  ]
}`,
      popularity: 88,
      complexity: "medium",
    },
    {
      id: "3",
      name: "Database Backup",
      description: "Trigger database backup on specific events",
      category: "Database",
      icon: <Database className="h-5 w-5" />,
      pattern: "transaction_count > 10000 OR data_change_ratio > 0.25",
      webhookUrl: "https://api.backup-service.com/trigger",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "${BACKUP_API_KEY}",
      },
      payload: `{
  "database": "{{ database_name }}",
  "type": "incremental",
  "reason": "{{ trigger_reason }}",
  "metrics": {
    "transactions": "{{ transaction_count }}",
    "changes": "{{ data_change_ratio }}"
  }
}`,
      popularity: 82,
      complexity: "advanced",
    },
    {
      id: "4",
      name: "Performance Monitor",
      description: "Monitor and alert on performance degradation",
      category: "Monitoring",
      icon: <Activity className="h-5 w-5" />,
      pattern: "response_time > 2s OR error_rate > 5% WITHIN 1m",
      webhookUrl: "https://api.pagerduty.com/v1/incident",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "${PAGERDUTY_TOKEN}",
      },
      payload: `{
  "incident": {
    "title": "Performance Degradation Detected",
    "service": "{{ service_name }}",
    "priority": "{{ response_time > 5s ? 'P1' : 'P2' }}",
    "metrics": {
      "response_time": "{{ response_time }}",
      "error_rate": "{{ error_rate }}"
    }
  }
}`,
      popularity: 78,
      complexity: "medium",
    },
  ];

  const categories = [
    { name: "All", icon: <Search className="h-4 w-4" /> },
    { name: "Infrastructure", icon: <Server className="h-4 w-4" /> },
    { name: "Security", icon: <Shield className="h-4 w-4" /> },
    { name: "Monitoring", icon: <Activity className="h-4 w-4" /> },
    { name: "Database", icon: <Database className="h-4 w-4" /> },
    { name: "Cloud", icon: <Cloud className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookTemplate className="h-5 w-5" />
          Webhook Templates
        </CardTitle>
        <CardDescription>
          Pre-built webhook configurations for common use cases
        </CardDescription>
        <div className="flex gap-2 mt-4">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{template.popularity}% used</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge>{template.category}</Badge>
                    <Badge variant="outline">{template.complexity}</Badge>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Pattern:</p>
                    <code className="text-sm bg-muted p-1 rounded">
                      {template.pattern}
                    </code>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                  <Button size="sm">Use Template</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookTemplates;
