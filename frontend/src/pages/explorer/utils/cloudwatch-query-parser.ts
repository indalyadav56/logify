// CloudWatch Logs Insights Query Parser

interface QueryCommand {
  type: string;
  params: Record<string, any>;
}

export interface ParsedQuery {
  commands: QueryCommand[];
  error?: string;
}

/**
 * Parse a CloudWatch Logs Insights query string into structured commands
 */
export function parseCloudWatchQuery(queryString: string): ParsedQuery {
  if (!queryString.trim()) {
    return { commands: [], error: "Empty query" };
  }

  try {
    // Split the query by pipe character and trim whitespace
    const commandStrings = queryString.split("|").map((cmd) => cmd.trim());
    const commands: QueryCommand[] = [];

    for (const cmdStr of commandStrings) {
      if (!cmdStr) continue;

      // Extract command type (first word)
      const cmdParts = cmdStr.split(" ");
      const cmdType = cmdParts[0].toLowerCase();

      switch (cmdType) {
        case "fields":
          commands.push(parseFieldsCommand(cmdStr));
          break;
        case "filter":
          commands.push(parseFilterCommand(cmdStr));
          break;
        case "stats":
          commands.push(parseStatsCommand(cmdStr));
          break;
        case "sort":
          commands.push(parseSortCommand(cmdStr));
          break;
        case "limit":
          commands.push(parseLimitCommand(cmdStr));
          break;
        case "parse":
          commands.push(parseParseCommand(cmdStr));
          break;
        default:
          return {
            commands,
            error: `Unknown command type: ${cmdType}`,
          };
      }
    }

    return { commands };
  } catch (error) {
    return {
      commands: [],
      error: `Failed to parse query: ${(error as Error).message}`,
    };
  }
}

/**
 * Parse 'fields' command: fields @timestamp, level, message
 */
function parseFieldsCommand(cmdStr: string): QueryCommand {
  // Remove 'fields' and split by commas
  const fieldsStr = cmdStr.substring("fields".length).trim();
  const fields = fieldsStr
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  return {
    type: "fields",
    params: { fields },
  };
}

/**
 * Parse 'filter' command: filter level = "ERROR" or filter @message like /error/i
 */
function parseFilterCommand(cmdStr: string): QueryCommand {
  // Remove 'filter' keyword
  const filterStr = cmdStr.substring("filter".length).trim();

  // Check for common operators
  let operator = "";
  let field = "";
  let value = "";

  if (filterStr.includes(" = ")) {
    [field, value] = filterStr.split(" = ").map((p) => p.trim());
    operator = "=";
  } else if (filterStr.includes(" != ")) {
    [field, value] = filterStr.split(" != ").map((p) => p.trim());
    operator = "!=";
  } else if (filterStr.includes(" > ")) {
    [field, value] = filterStr.split(" > ").map((p) => p.trim());
    operator = ">";
  } else if (filterStr.includes(" < ")) {
    [field, value] = filterStr.split(" < ").map((p) => p.trim());
    operator = "<";
  } else if (filterStr.includes(" >= ")) {
    [field, value] = filterStr.split(" >= ").map((p) => p.trim());
    operator = ">=";
  } else if (filterStr.includes(" <= ")) {
    [field, value] = filterStr.split(" <= ").map((p) => p.trim());
    operator = "<=";
  } else if (filterStr.includes(" like ")) {
    [field, value] = filterStr.split(" like ").map((p) => p.trim());
    operator = "like";
  } else if (filterStr.includes(" not like ")) {
    [field, value] = filterStr.split(" not like ").map((p) => p.trim());
    operator = "not like";
  } else {
    // Default to simple equality if no operator is found
    const parts = filterStr.split(" ");
    field = parts[0];
    operator = "=";
    value = parts.slice(1).join(" ");
  }

  // Clean up value (remove quotes if present)
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.substring(1, value.length - 1);
  } else if (value.startsWith("'") && value.endsWith("'")) {
    value = value.substring(1, value.length - 1);
  }

  return {
    type: "filter",
    params: { field, operator, value },
  };
}

/**
 * Parse 'stats' command: stats count(*) by level, service
 */
function parseStatsCommand(cmdStr: string): QueryCommand {
  // Remove 'stats' keyword
  const statsStr = cmdStr.substring("stats".length).trim();

  let aggregation = "";
  let groupBy: string[] = [];

  // Check if there's a 'by' clause for grouping
  if (statsStr.includes(" by ")) {
    const [aggPart, groupPart] = statsStr.split(" by ").map((p) => p.trim());
    aggregation = aggPart;
    groupBy = groupPart.split(",").map((g) => g.trim());
  } else {
    aggregation = statsStr;
  }

  // Parse the aggregation function and field
  let aggFunction = "";
  let aggField = "";

  if (aggregation.includes("(") && aggregation.includes(")")) {
    aggFunction = aggregation.substring(0, aggregation.indexOf("("));
    aggField = aggregation.substring(
      aggregation.indexOf("(") + 1,
      aggregation.indexOf(")")
    );
  }

  return {
    type: "stats",
    params: {
      function: aggFunction,
      field: aggField,
      groupBy,
    },
  };
}

/**
 * Parse 'sort' command: sort @timestamp desc
 */
function parseSortCommand(cmdStr: string): QueryCommand {
  // Remove 'sort' keyword
  const sortStr = cmdStr.substring("sort".length).trim();

  const parts = sortStr.split(" ");
  const field = parts[0];
  const direction = parts.length > 1 ? parts[1].toLowerCase() : "asc";

  return {
    type: "sort",
    params: { field, direction },
  };
}

/**
 * Parse 'limit' command: limit 100
 */
function parseLimitCommand(cmdStr: string): QueryCommand {
  // Remove 'limit' keyword
  const limitStr = cmdStr.substring("limit".length).trim();
  const limit = parseInt(limitStr, 10);

  return {
    type: "limit",
    params: { limit: isNaN(limit) ? 20 : limit },
  };
}

/**
 * Parse 'parse' command: parse @message "user: *" as user
 */
function parseParseCommand(cmdStr: string): QueryCommand {
  // Remove 'parse' keyword
  const parseStr = cmdStr.substring("parse".length).trim();

  // Extract field, pattern and alias
  let field = "";
  let pattern = "";
  let alias = "";

  // Check for 'as' keyword for alias
  if (parseStr.includes(" as ")) {
    const [mainPart, aliasPart] = parseStr.split(" as ").map((p) => p.trim());
    alias = aliasPart;

    // Extract field and pattern from main part
    const firstSpace = mainPart.indexOf(" ");
    if (firstSpace > 0) {
      field = mainPart.substring(0, firstSpace).trim();
      pattern = mainPart.substring(firstSpace).trim();

      // Remove quotes from pattern if present
      if (pattern.startsWith('"') && pattern.endsWith('"')) {
        pattern = pattern.substring(1, pattern.length - 1);
      } else if (pattern.startsWith("'") && pattern.endsWith("'")) {
        pattern = pattern.substring(1, pattern.length - 1);
      }
    }
  }

  return {
    type: "parse",
    params: { field, pattern, alias },
  };
}

/**
 * Convert parsed CloudWatch query to Logify filter format
 */
export function convertToLogifyFilters(
  parsedQuery: ParsedQuery
): Record<string, any> {
  const filters: Record<string, any> = {
    searchMessages: [],
    selectedLevels: [],
    metadata: {},
    page: 1,
    limit: 20,
    sortOrder: "desc",
  };

  for (const command of parsedQuery.commands) {
    switch (command.type) {
      case "filter":
        handleFilterCommand(command, filters);
        break;
      case "sort":
        handleSortCommand(command, filters);
        break;
      case "limit":
        handleLimitCommand(command, filters);
        break;
      // Other commands might affect the UI display but not directly the filters
    }
  }

  return filters;
}

function handleFilterCommand(
  command: QueryCommand,
  filters: Record<string, any>
): void {
  const { field, operator, value } = command.params;

  // Handle level filters
  if (field === "level" && operator === "=") {
    filters.selectedLevels.push(value.toUpperCase());
  }
  // Handle service filter
  else if (field === "service" && operator === "=") {
    filters.selectedService = value;
  }
  // Handle message search
  else if (
    (field === "message" || field === "@message") &&
    (operator === "=" || operator === "like")
  ) {
    filters.searchMessages.push(value);
  }
  // Handle metadata filters
  else if (
    !field.startsWith("@") &&
    field !== "level" &&
    field !== "service" &&
    field !== "message"
  ) {
    filters.metadata[field] = value;
  }
}

function handleSortCommand(
  command: QueryCommand,
  filters: Record<string, any>
): void {
  const { field, direction } = command.params;

  if (field === "@timestamp" || field === "timestamp") {
    filters.sortOrder = direction === "desc" ? "desc" : "asc";
  }
}

function handleLimitCommand(
  command: QueryCommand,
  filters: Record<string, any>
): void {
  const { limit } = command.params;
  filters.limit = limit;
}
