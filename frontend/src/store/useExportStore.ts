import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ExportFormat = 'json' | 'csv' | 'parquet' | 'ndjson';
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

interface TimeRange {
  from: string;
  to: string;
}

interface ExportFilters {
  tenant_id?: string;
  project_id?: string;
  service?: string;
  level: LogLevel[];
  timestamp_range: TimeRange;
  format: ExportFormat;
  include_metadata: boolean;
  include_trace: boolean;
  batch_size?: number;
  compression?: boolean;
  fields?: string[];
}

interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filters: ExportFilters;
  created_at: string;
  download_url?: string;
  error?: string;
}

interface ExportState {
  currentFilters: ExportFilters;
  recentExports: ExportJob[];
  isExporting: boolean;
  setFilters: (filters: Partial<ExportFilters>) => void;
  resetFilters: () => void;
  addExportJob: (job: ExportJob) => void;
  updateExportJob: (id: string, updates: Partial<ExportJob>) => void;
  clearCompletedJobs: () => void;
}

const defaultFilters: ExportFilters = {
  level: ['ERROR', 'WARN', 'INFO'],
  timestamp_range: {
    from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
    to: new Date().toISOString(),
  },
  format: 'json',
  include_metadata: true,
  include_trace: true,
  compression: false,
};

export const useExportStore = create<ExportState>()(
  devtools(
    persist(
      (set) => ({
        currentFilters: defaultFilters,
        recentExports: [],
        isExporting: false,

        setFilters: (filters) =>
          set((state) => ({
            currentFilters: { ...state.currentFilters, ...filters },
          })),

        resetFilters: () =>
          set(() => ({
            currentFilters: defaultFilters,
          })),

        addExportJob: (job) =>
          set((state) => ({
            recentExports: [job, ...state.recentExports.slice(0, 9)], // Keep last 10 jobs
          })),

        updateExportJob: (id, updates) =>
          set((state) => ({
            recentExports: state.recentExports.map((job) =>
              job.id === id ? { ...job, ...updates } : job
            ),
          })),

        clearCompletedJobs: () =>
          set((state) => ({
            recentExports: state.recentExports.filter(
              (job) => job.status === 'pending' || job.status === 'processing'
            ),
          })),
      }),
      {
        name: 'logify-export-storage',
      }
    )
  )
);
