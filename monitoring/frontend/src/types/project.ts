export type Environment = 'development' | 'staging' | 'production';

export interface Project {
  id: string;
  name: string;
  description: string;
  environments: Environment[];
  createdAt: string;
  updatedAt: string;
  owner: string;
  team?: string[];
  settings: {
    retention: number;
    maxSize: number;
    alertEnabled: boolean;
  };
  stats: {
    totalLogs: number;
    storageUsed: number;
    activeUsers: number;
  };
}

export interface ProjectEnvironment {
  id: string;
  projectId: string;
  name: Environment;
  apiKey: string;
  config: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    sampling: number;
    retention: number;
    filters: string[];
  };
  status: 'active' | 'inactive';
  metrics: {
    logsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
}
