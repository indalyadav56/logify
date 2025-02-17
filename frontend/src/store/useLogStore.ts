import { create } from 'zustand'
import axios from 'axios'

interface Log {
  id: string
  message: string
  level: string
  service: string
  timestamp: string
  metadata: Record<string, string>
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
  limit: 50,
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
      from.setMinutes(now.getMinutes() - 15);
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
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }))
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
    set({ filters: initialFilters })
  },

  fetchLogs: async () => {
    const { filters } = get()
    set({ isLoading: true, error: null })
    
    try {
      const timeRange = filters.isCustomRange
        ? {
            from: filters.customDateRange.from.toISOString(),
            to: filters.customDateRange.to.toISOString(),
          }
        : calculateTimeRange(filters.timeRange)

      const requestBody = {
        service: filters.selectedService === "all" ? undefined : filters.selectedService,
        levels: filters.selectedLevels.length > 0 ? filters.selectedLevels : undefined,
        message_contains: filters.searchMessages,
        timestamp_range: timeRange,
        metadata: Object.keys(filters.metadata).length > 0 ? filters.metadata : undefined,
        sort: "timestamp",
        order: filters.sortOrder,
        page: filters.page,
        limit: filters.limit
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
      )

      set({ logs: response.data.data, isLoading: false })
    } catch (error) {
      console.error('Error fetching logs:', error)
      set({ error: 'Failed to fetch logs', isLoading: false })
    }
  },
}))
