import { z } from "zod";

export const standardLogSchema = z.object({
  level: z.string(),
  message: z.string(),
  service: z.string().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type StandardLog = z.infer<typeof standardLogSchema>;

export interface ParserRule {
  name: string;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => Partial<StandardLog>;
}

// Common log patterns
export const defaultParserRules: ParserRule[] = [
  // Nginx-style logs
  {
    name: "Nginx Access Log",
    pattern: /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(.+?)" (\d{3}) (\d+) "([^"]*)" "([^"]*)"/,
    extract: (match) => ({
      level: "info",
      message: `${match[5]} - Status ${match[6]}`,
      service: "nginx",
      timestamp: match[4],
      metadata: {
        ip: match[1],
        user: match[3],
        status: parseInt(match[6]),
        bytes: parseInt(match[7]),
        referer: match[8],
        userAgent: match[9],
      },
    }),
  },
  // Apache-style logs
  {
    name: "Apache Access Log",
    pattern: /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(.+?)" (\d{3}) (\d+)/,
    extract: (match) => ({
      level: "info",
      message: `${match[5]} - Status ${match[6]}`,
      service: "apache",
      timestamp: match[4],
      metadata: {
        ip: match[1],
        user: match[3],
        status: parseInt(match[6]),
        bytes: parseInt(match[7]),
      },
    }),
  },
  // Syslog-style
  {
    name: "Syslog",
    pattern: /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\w+)(?:\[(\d+)\])?:\s+(.+)/,
    extract: (match) => ({
      level: "info",
      message: match[5],
      service: match[2],
      timestamp: match[1],
      metadata: {
        process: match[3],
        pid: match[4] ? parseInt(match[4]) : undefined,
      },
    }),
  },
  // Log4j/Winston-style
  {
    name: "Log4j/Winston",
    pattern: /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s+(\w+)\s+\[(.+?)\]\s+(.+)/,
    extract: (match) => ({
      level: match[2].toLowerCase(),
      message: match[4],
      timestamp: match[1],
      metadata: {
        context: match[3],
      },
    }),
  },
  // JSON-like logs with level and message
  {
    name: "JSON-like",
    pattern: /"level":\s*"(\w+)".*?"message":\s*"([^"]+)"/,
    extract: (match) => ({
      level: match[1],
      message: match[2],
    }),
  },
  // Simple level-message pattern
  {
    name: "Simple Level-Message",
    pattern: /^(\[?(?:ERROR|WARN|INFO|DEBUG)\]?)\s*[-:]\s*(.+)/i,
    extract: (match) => ({
      level: match[1].replace(/[\[\]]/g, "").toLowerCase(),
      message: match[2],
    }),
  },
];

export class LogParser {
  private rules: ParserRule[];
  private customPatterns: Record<string, RegExp>;

  constructor(additionalRules: ParserRule[] = []) {
    this.rules = [...defaultParserRules, ...additionalRules];
    this.customPatterns = {};
  }

  addCustomPattern(name: string, pattern: RegExp) {
    this.customPatterns[name] = pattern;
  }

  addRule(rule: ParserRule) {
    this.rules.push(rule);
  }

  parse(logLine: string): StandardLog {
    // Try parsing as JSON first
    try {
      const jsonLog = JSON.parse(logLine);
      if (jsonLog.level && jsonLog.message) {
        return this.standardize(jsonLog);
      }
    } catch (e) {
      // Not JSON, continue with pattern matching
    }

    // Try each parser rule
    for (const rule of this.rules) {
      const match = logLine.match(rule.pattern);
      if (match) {
        return this.standardize(rule.extract(match));
      }
    }

    // If no patterns match, create a basic log entry
    return this.standardize({
      level: this.guessLogLevel(logLine),
      message: logLine.trim(),
    });
  }

  private standardize(log: Partial<StandardLog>): StandardLog {
    return {
      level: this.normalizeLevel(log.level || "info"),
      message: log.message || "",
      service: log.service || "unknown",
      timestamp: log.timestamp || new Date().toISOString(),
      metadata: log.metadata || {},
    };
  }

  private normalizeLevel(level: string): string {
    level = level.toLowerCase();
    const levelMap: Record<string, string> = {
      error: "error",
      err: "error",
      warn: "warn",
      warning: "warn",
      info: "info",
      information: "info",
      debug: "debug",
      trace: "debug",
      fatal: "error",
    };
    return levelMap[level] || "info";
  }

  private guessLogLevel(logLine: string): string {
    const line = logLine.toLowerCase();
    if (line.includes("error") || line.includes("fatal") || line.includes("fail")) {
      return "error";
    }
    if (line.includes("warn")) {
      return "warn";
    }
    if (line.includes("debug")) {
      return "debug";
    }
    return "info";
  }

  parseMultipleLines(logs: string[]): StandardLog[] {
    return logs.map(log => this.parse(log));
  }

  async parseStream(stream: ReadableStream<string>): Promise<StandardLog[]> {
    const reader = stream.getReader();
    const logs: StandardLog[] = [];
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        logs.push(this.parse(value));
      }
    } finally {
      reader.releaseLock();
    }
    
    return logs;
  }
}
