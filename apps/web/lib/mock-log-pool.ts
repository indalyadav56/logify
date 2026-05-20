import { generateLogs, type LogEntry } from "@/lib/mock-data"

/** Full mock corpus for cursor-style pagination demos (~1k rows). */
export const MOCK_LOG_POOL: LogEntry[] = generateLogs(1000, 42)
