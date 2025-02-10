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
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings,
  Plus,
  BarChart,
  Key,
  UserCheck,
  History,
  Search,
  Calendar,
} from 'lucide-react';

interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'privacy' | 'operational' | 'regulatory';
  status: 'compliant' | 'non-compliant' | 'pending' | 'exempted';
  priority: 'critical' | 'high' | 'medium' | 'low';
  framework: string;
  requirements: {
    id: string;
    description: string;
    status: 'met' | 'not-met' | 'in-progress';
    evidence?: string;
  }[];
  lastAssessment?: {
    date: string;
    score: number;
    findings: number;
    assessor: string;
  };
  nextAssessment: string;
  risks: {
    id: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    mitigation?: string;
  }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  user: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
  metadata: {
    ip: string;
    location: string;
    device: string;
  };
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

const ComplianceManager = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Sample compliance policies
  const policies: CompliancePolicy[] = [
    {
      id: '1',
      name: 'Data Protection Policy',
      description: 'Ensures proper handling and protection of sensitive data',
      category: 'privacy',
      status: 'compliant',
      priority: 'critical',
      framework: 'GDPR',
      requirements: [
        {
          id: 'r1',
          description: 'Data encryption at rest',
          status: 'met',
          evidence: 'AES-256 encryption implemented',
        },
        {
          id: 'r2',
          description: 'Data retention policies',
          status: 'met',
          evidence: 'Automated data cleanup after 90 days',
        },
        {
          id: 'r3',
          description: 'User consent management',
          status: 'in-progress',
        },
      ],
      lastAssessment: {
        date: '2025-01-15',
        score: 92,
        findings: 2,
        assessor: 'Security Team',
      },
      nextAssessment: '2025-04-15',
      risks: [
        {
          id: 'risk1',
          description: 'Unauthorized data access',
          severity: 'high',
          mitigation: 'Implemented role-based access control',
        },
        {
          id: 'risk2',
          description: 'Data breach',
          severity: 'critical',
          mitigation: 'Regular security audits and monitoring',
        },
      ],
    },
    {
      id: '2',
      name: 'Access Control Policy',
      description: 'Defines access control and authentication requirements',
      category: 'security',
      status: 'non-compliant',
      priority: 'high',
      framework: 'ISO 27001',
      requirements: [
        {
          id: 'r4',
          description: 'Multi-factor authentication',
          status: 'not-met',
        },
        {
          id: 'r5',
          description: 'Password complexity',
          status: 'met',
          evidence: 'Password policy enforced',
        },
        {
          id: 'r6',
          description: 'Access reviews',
          status: 'in-progress',
        },
      ],
      lastAssessment: {
        date: '2025-01-20',
        score: 78,
        findings: 5,
        assessor: 'External Auditor',
      },
      nextAssessment: '2025-02-20',
      risks: [
        {
          id: 'risk3',
          description: 'Weak authentication',
          severity: 'high',
          mitigation: 'Implementing MFA',
        },
      ],
    },
  ];

  // Sample audit logs
  const auditLogs: AuditLog[] = [
    {
      id: 'a1',
      timestamp: '2025-01-31T06:15:00',
      action: 'User Login',
      resource: 'Authentication System',
      user: 'john.doe@example.com',
      status: 'success',
      details: 'Successful login with 2FA',
      metadata: {
        ip: '192.168.1.100',
        location: 'New York, US',
        device: 'Chrome/Windows',
      },
    },
    {
      id: 'a2',
      timestamp: '2025-01-31T06:10:00',
      action: 'Data Export',
      resource: 'Customer Database',
      user: 'jane.smith@example.com',
      status: 'warning',
      details: 'Large data export initiated',
      metadata: {
        ip: '192.168.1.101',
        location: 'London, UK',
        device: 'Firefox/MacOS',
      },
    },
  ];

  // Sample security metrics
  const metrics: SecurityMetric[] = [
    {
      id: 'm1',
      name: 'Security Score',
      value: 85,
      target: 90,
      trend: 'up',
      period: '30d',
    },
    {
      id: 'm2',
      name: 'Policy Compliance',
      value: 92,
      target: 95,
      trend: 'stable',
      period: '30d',
    },
    {
      id: 'm3',
      name: 'Risk Coverage',
      value: 78,
      target: 85,
      trend: 'up',
      period: '30d',
    },
    {
      id: 'm4',
      name: 'Audit Coverage',
      value: 88,
      target: 90,
      trend: 'down',
      period: '30d',
    },
  ];

  const getStatusColor = (status: CompliancePolicy['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 text-green-700';
      case 'non-compliant':
        return 'bg-red-50 text-red-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'exempted':
        return 'bg-blue-50 text-blue-700';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: CompliancePolicy['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-700';
      case 'high':
        return 'bg-orange-50 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'low':
        return 'bg-blue-50 text-blue-700';
      default:
        return '';
    }
  };

  const getRequirementStatusColor = (status: CompliancePolicy['requirements'][0]['status']) => {
    switch (status) {
      case 'met':
        return 'text-green-500';
      case 'not-met':
        return 'text-red-500';
      case 'in-progress':
        return 'text-yellow-500';
      default:
        return '';
    }
  };

  const getAuditStatusColor = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'failure':
        return 'bg-red-50 text-red-700';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Compliance Manager</h1>
          <p className="text-muted-foreground">
            Monitor and manage compliance requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{metric.name}</h3>
                <Badge
                  variant="outline"
                  className={
                    metric.value >= metric.target
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }
                >
                  Target: {metric.target}%
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-2">{metric.value}%</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart className="h-4 w-4" />
                <span>{metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}</span>
                <span>Last {metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Compliance Policies */}
        <div className="col-span-12 space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{policy.name}</h3>
                      <Badge
                        variant="outline"
                        className={getStatusColor(policy.status)}
                      >
                        {policy.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(policy.priority)}
                      >
                        {policy.priority}
                      </Badge>
                      <Badge variant="secondary">{policy.framework}</Badge>
                    </div>
                    <p className="text-muted-foreground">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="mr-2 h-4 w-4" />
                      Assess
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Report
                    </Button>
                    <Button size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Requirements</h4>
                  <div className="space-y-2">
                    {policy.requirements.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {req.status === 'met' ? (
                            <CheckCircle
                              className={`h-4 w-4 ${getRequirementStatusColor(
                                req.status
                              )}`}
                            />
                          ) : req.status === 'not-met' ? (
                            <XCircle
                              className={`h-4 w-4 ${getRequirementStatusColor(
                                req.status
                              )}`}
                            />
                          ) : (
                            <Clock
                              className={`h-4 w-4 ${getRequirementStatusColor(
                                req.status
                              )}`}
                            />
                          )}
                          <span className="text-sm">{req.description}</span>
                        </div>
                        {req.evidence && (
                          <span className="text-sm text-muted-foreground">
                            {req.evidence}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Identified Risks</h4>
                  <div className="space-y-2">
                    {policy.risks.map((risk) => (
                      <div
                        key={risk.id}
                        className="p-3 bg-muted rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                risk.severity === 'critical' || risk.severity === 'high'
                                  ? 'text-red-500'
                                  : 'text-yellow-500'
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {risk.description}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(risk.severity)}
                          >
                            {risk.severity}
                          </Badge>
                        </div>
                        {risk.mitigation && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>{risk.mitigation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment Info */}
                {policy.lastAssessment && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Last Assessment</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Date</span>
                          <span>{policy.lastAssessment.date}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Score</span>
                          <span>{policy.lastAssessment.score}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Findings</span>
                          <span>{policy.lastAssessment.findings}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Assessor</span>
                          <span>{policy.lastAssessment.assessor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Next Assessment</h5>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{policy.nextAssessment}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Audit Logs */}
        <div className="col-span-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Audit Logs</h2>
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  Export Logs
                </Button>
              </div>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.action}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getAuditStatusColor(log.status)}
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{log.metadata.ip}</span>
                      <span>•</span>
                      <span>{log.metadata.location}</span>
                      <span>•</span>
                      <span>{log.metadata.device}</span>
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

export default ComplianceManager;
