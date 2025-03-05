import { create } from 'zustand'
import axios from 'axios'
import { ParsedQuery } from '@/pages/explorer/utils/cloudwatch-query-parser'

interface Log {
  id: string
  message: string
  level: string
  service: string
  timestamp: string
  metadata: Record<string, string>
  is_bookmarked: boolean
}

interface LogFilters {
  searchMessages: string[]
  selectedLevels: string[]
  selectedService: string
  timeRange: string
  customDateRange: {
    from: Date
    to: Date
  }
  isCustomRange: boolean
  metadata: Record<string, string>
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

interface LogStore {
  // State
  logs: Log[]
  filters: LogFilters
  isLoading: boolean
  error: string | null
  
  // Actions
  setFilter: <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => void
  addSearchMessage: (message: string) => void
  removeSearchMessage: (message: string) => void
  addMetadata: (key: string, value: string) => void
  removeMetadata: (key: string) => void
  fetchLogs: () => Promise<void>
  executeCloudWatchQuery: (parsedQuery: ParsedQuery) => Promise<void>
  clearFilters: () => void
}

const initialFilters: LogFilters = {
  searchMessages: [],
  selectedLevels: [],
  selectedService: 'all',
  timeRange: '15m',
  customDateRange: {
    from: new Date(),
    to: new Date(),
  },
  isCustomRange: false,
  metadata: {},
  sortOrder: 'desc',
  page: 1,
  limit: 20,
}

const calculateTimeRange = (range: string) => {
  const now = new Date();
  const from = new Date();

  switch (range) {
    case "15m":
      from.setMinutes(now.getMinutes() - 15);
      break;
    case "1h":
      from.setHours(now.getHours() - 1);
      break;
    case "6h":
      from.setHours(now.getHours() - 6);
      break;
    case "24h":
      from.setHours(now.getHours() - 24);
      break;
    case "7d":
      from.setDate(now.getDate() - 7);
      break;
    default:
      from.setDate(now.getDate() - 7);
      // from.setMinutes(now.getMinutes() - 15);
  }

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
};

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  filters: initialFilters,
  isLoading: false,
  error: null,

  setFilter: (key, value) => {
    set((state) => {
      // If we're changing the page number, just update it
      if (key === 'page') {
        return {
          filters: {
            ...state.filters,
            [key]: value,
          }
        };
      }
      
      // For other filter changes, reset the page to 1 and clear logs
      return {
        logs: [], // Clear logs when filters change
        filters: {
          ...state.filters,
          [key]: value,
          page: 1,
        },
      };
    });
  },

  addSearchMessage: (message) => {
    set((state) => ({
      filters: {
        ...state.filters,
        searchMessages: [...state.filters.searchMessages, message],
      },
    }))
  },

  removeSearchMessage: (message) => {
    set((state) => ({
      filters: {
        ...state.filters,
        searchMessages: state.filters.searchMessages.filter((m) => m !== message),
      },
    }))
  },

  addMetadata: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        metadata: {
          ...state.filters.metadata,
          [key]: value,
        },
      },
    }))
  },

  removeMetadata: (key) => {
    set((state) => {
      const newMetadata = { ...state.filters.metadata }
      delete newMetadata[key]
      return {
        filters: {
          ...state.filters,
          metadata: newMetadata,
        },
      }
    })
  },

  clearFilters: () => {
    set((state) => ({
      filters: {
        ...initialFilters,
        selectedService: state.filters.selectedService, // Preserve service selection
      },
      logs: [],
    }));
  },

  executeCloudWatchQuery: async (parsedQuery: ParsedQuery) => {
    if (parsedQuery.error || parsedQuery.commands.length === 0) {
      set({ error: parsedQuery.error || 'Invalid query' });
      return;
    }

    set({ isLoading: true, logs: [], error: null });

    try {
      // Extract commands by type
      const fieldsCmd = parsedQuery.commands.find(cmd => cmd.type === 'fields');
      const filterCmds = parsedQuery.commands.filter(cmd => cmd.type === 'filter');
      const sortCmd = parsedQuery.commands.find(cmd => cmd.type === 'sort');
      const limitCmd = parsedQuery.commands.find(cmd => cmd.type === 'limit');

      // Build request body
      const requestBody: Record<string, any> = {
        page: 1,
        limit: limitCmd?.params.limit || 20,
      };

      // Handle filters
      const serviceFilter = filterCmds.find(cmd => 
        cmd.params.field === 'service' && cmd.params.operator === '='
      );
      if (serviceFilter) {
        requestBody.service = serviceFilter.params.value;
      }

      // Handle level filters
      const levelFilters = filterCmds.filter(cmd => 
        cmd.params.field === 'level' && cmd.params.operator === '='
      );
      if (levelFilters.length > 0) {
        requestBody.levels = levelFilters.map(cmd => cmd.params.value);
      }

      // Handle message search
      const messageFilters = filterCmds.filter(cmd => 
        (cmd.params.field === 'message' || cmd.params.field === '@message') && 
        (cmd.params.operator === '=' || cmd.params.operator === 'like')
      );
      if (messageFilters.length > 0) {
        requestBody.message_contains = messageFilters.map(cmd => cmd.params.value);
      }

      // Handle metadata filters
      const metadataFilters = filterCmds.filter(cmd => 
        !cmd.params.field.startsWith('@') && 
        cmd.params.field !== 'level' && 
        cmd.params.field !== 'service' && 
        cmd.params.field !== 'message'
      );
      if (metadataFilters.length > 0) {
        requestBody.metadata = {};
        metadataFilters.forEach(cmd => {
          requestBody.metadata[cmd.params.field] = cmd.params.value;
        });
      }

      // Handle sort
      if (sortCmd) {
        const { field, direction } = sortCmd.params;
        if (field === '@timestamp' || field === 'timestamp') {
          requestBody.sort = 'timestamp';
          requestBody.order = direction;
        }
      } else {
        // Default sort
        requestBody.sort = 'timestamp';
        requestBody.order = 'desc';
      }

      const response = await axios.post(
        'http://localhost:8080/v1/logs/search',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0X2lkIjoiYTdjMDI4MjYtMDA1YS00Y2MxLWE0ZWYtYmMxNjJjY2ZjYWFhIiwidGVuYW50X2lkIjoiZDliZGZjMDYtYWMxYi00MTU5LTg1ZWEtMTNmODVhNjJiNzQ0IiwidXNlcl9pZCI6ImRjZmYxNjFjLWI4YmUtNGRiNS1iYjMzLWFjNjBlMTVmNDM4MiJ9.zlrqHhCe0KErS_-8QOQgla3WWP528G2YjooeU2jIsYk`,
          },
        }
      );

      set({
        logs: response.data.data || [],
        isLoading: false,
        // Update filters to match the query
        filters: {
          ...get().filters,
          page: 1,
          limit: limitCmd?.params.limit || 20,
          sortOrder: (sortCmd?.params.direction === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
        }
      });
    } catch (error) {
      console.error('Error executing CloudWatch query:', error);
      set({ 
        error: 'Failed to execute CloudWatch query',
        isLoading: false,
        logs: []
      });
    }
  },

  fetchLogs: async () => {
    const { filters, logs: currentLogs } = get();
    
    // Don't set loading state for subsequent pages to prevent flicker
    if (filters.page === 1) {
      set({ isLoading: true, logs: [], error: null });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const timeRange = filters.isCustomRange
        ? {
            from: filters.customDateRange.from.toISOString(),
            to: filters.customDateRange.to.toISOString(),
          }
        : calculateTimeRange(filters.timeRange);

      const requestBody = {
        service: filters.selectedService === "all" ? undefined : filters.selectedService,
        levels: filters.selectedLevels.length > 0 ? filters.selectedLevels : undefined,
        message_contains: filters.searchMessages,
        // timestamp_range: timeRange,
        metadata: Object.keys(filters.metadata).length > 0 ? filters.metadata : undefined,
        sort: "timestamp",
        order: filters.sortOrder,
        page: filters.page,
        limit: filters.limit
      };

      const response = await axios.post(
        'http://localhost:8080/v1/logs/search',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0X2lkIjoiYTdjMDI4MjYtMDA1YS00Y2MxLWE0ZWYtYmMxNjJjY2ZjYWFhIiwidGVuYW50X2lkIjoiZDliZGZjMDYtYWMxYi00MTU5LTg1ZWEtMTNmODVhNjJiNzQ0IiwidXNlcl9pZCI6ImRjZmYxNjFjLWI4YmUtNGRiNS1iYjMzLWFjNjBlMTVmNDM4MiJ9.zlrqHhCe0KErS_-8QOQgla3WWP528G2YjooeU2jIsYk`,
          },
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For subsequent pages, append new logs
      if (filters.page > 1) {
        set({
          logs: [...currentLogs, ...(response.data.data || [])],
          isLoading: false
        });
      } else {
        // For first page, replace all logs
        set({
          logs: response.data.data || [],
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      set({ 
        error: 'Failed to fetch logs',
        isLoading: false,
        // Keep existing logs on error
        logs: currentLogs
      });
    }
  },
}))
