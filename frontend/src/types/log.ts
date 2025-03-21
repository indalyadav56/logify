export interface Log {
    id: string;
    service: string;
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace' | string;
    message: string;
    metadata: Record<string, unknown>;
    timestamp: string;
}