import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ImportSource = 'file' | 's3' | 'url' | 'api';
export type ImportStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
export type FileFormat = 'json' | 'csv' | 'txt' | 'log';

export interface ImportConfig {
  source: ImportSource;
  format: FileFormat;
  parseOptions: {
    delimiter?: string;
    timeField?: string;
    timeFormat?: string;
    levelField?: string;
    messageField?: string;
    customFields?: string[];
    ignoreFields?: string[];
  };
  transformations: {
    enabled: boolean;
    rules: {
      field: string;
      operation: 'rename' | 'delete' | 'format' | 'extract' | 'combine';
      params: Record<string, any>;
    }[];
  };
  validation: {
    enabled: boolean;
    rules: {
      field: string;
      type: 'required' | 'format' | 'range' | 'regex';
      params: Record<string, any>;
    }[];
  };
}

export interface ImportJob {
  id: string;
  name: string;
  source: ImportSource;
  config: ImportConfig;
  status: ImportStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors: Array<{
    line: number;
    message: string;
    data?: any;
  }>;
  startTime: string;
  endTime?: string;
  createdBy: string;
  metadata: Record<string, any>;
}

interface S3Config {
  bucket: string;
  region: string;
  prefix?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  assumeRole?: string;
}

interface ImportState {
  jobs: ImportJob[];
  activeJob: ImportJob | null;
  isLoading: boolean;
  error: string | null;
  
  // File Upload
  uploadFile: (
    files: File[],
    config: ImportConfig
  ) => Promise<void>;
  
  // S3 Import
  importFromS3: (
    s3Config: S3Config,
    importConfig: ImportConfig
  ) => Promise<void>;
  
  // URL Import
  importFromUrl: (
    url: string,
    config: ImportConfig
  ) => Promise<void>;
  
  // API Import
  importFromApi: (
    endpoint: string,
    headers: Record<string, string>,
    config: ImportConfig
  ) => Promise<void>;
  
  // Job Management
  getJob: (id: string) => ImportJob | null;
  cancelJob: (id: string) => Promise<void>;
  retryJob: (id: string) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  clearErrors: () => void;
  
  // Validation & Preview
  validateConfig: (config: ImportConfig) => Promise<{
    isValid: boolean;
    errors: string[];
  }>;
  previewImport: (
    source: ImportSource,
    data: any,
    config: ImportConfig
  ) => Promise<{
    headers: string[];
    sample: any[];
    stats: {
      totalFields: number;
      totalRecords: number;
      invalidRecords: number;
      warnings: string[];
    };
  }>;
}

export const useImportStore = create<ImportState>()(
  devtools(
    (set, get) => ({
      jobs: [],
      activeJob: null,
      isLoading: false,
      error: null,

      uploadFile: async (files, config) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          files.forEach((file) => formData.append('files', file));
          formData.append('config', JSON.stringify(config));

          const response = await fetch('http://localhost:8080/v1/import/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload files');
          }

          const job = await response.json();
          set((state) => ({
            jobs: [job, ...state.jobs],
            activeJob: job,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      importFromS3: async (s3Config, importConfig) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:8080/v1/import/s3', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              s3Config,
              importConfig,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to import from S3');
          }

          const job = await response.json();
          set((state) => ({
            jobs: [job, ...state.jobs],
            activeJob: job,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      importFromUrl: async (url, config) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:8080/v1/import/url', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, config }),
          });

          if (!response.ok) {
            throw new Error('Failed to import from URL');
          }

          const job = await response.json();
          set((state) => ({
            jobs: [job, ...state.jobs],
            activeJob: job,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      importFromApi: async (endpoint, headers, config) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:8080/v1/import/api', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint, headers, config }),
          });

          if (!response.ok) {
            throw new Error('Failed to import from API');
          }

          const job = await response.json();
          set((state) => ({
            jobs: [job, ...state.jobs],
            activeJob: job,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      getJob: (id) => {
        return get().jobs.find((job) => job.id === id) || null;
      },

      cancelJob: async (id) => {
        try {
          const response = await fetch(
            `http://localhost:8080/v1/import/jobs/${id}/cancel`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to cancel import job');
          }

          set((state) => ({
            jobs: state.jobs.map((job) =>
              job.id === id ? { ...job, status: 'failed' } : job
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      retryJob: async (id) => {
        try {
          const response = await fetch(
            `http://localhost:8080/v1/import/jobs/${id}/retry`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to retry import job');
          }

          const job = await response.json();
          set((state) => ({
            jobs: state.jobs.map((j) => (j.id === id ? job : j)),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      deleteJob: async (id) => {
        try {
          const response = await fetch(
            `http://localhost:8080/v1/import/jobs/${id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to delete import job');
          }

          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      validateConfig: async (config) => {
        try {
          const response = await fetch('http://localhost:8080/v1/import/validate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          });

          if (!response.ok) {
            throw new Error('Failed to validate import configuration');
          }

          return await response.json();
        } catch (error) {
          set({ error: (error as Error).message });
          return {
            isValid: false,
            errors: [(error as Error).message],
          };
        }
      },

      previewImport: async (source, data, config) => {
        try {
          const response = await fetch('http://localhost:8080/v1/import/preview', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source, data, config }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate import preview');
          }

          return await response.json();
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      clearErrors: () => {
        set({ error: null });
      },
    })
  )
);
