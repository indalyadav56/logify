import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface LogBookmark {
  id: string;
  name: string;
  description?: string;
  query: {
    service?: string;
    level?: string[];
    timeRange?: {
      from: string;
      to: string;
    };
    filters?: Record<string, any>;
  };
  color?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  folder?: string;
}

interface BookmarkState {
  bookmarks: LogBookmark[];
  folders: string[];
  isLoading: boolean;
  error: string | null;
  selectedBookmark: LogBookmark | null;
  addBookmark: (bookmark: Omit<LogBookmark, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBookmark: (id: string, updates: Partial<LogBookmark>) => void;
  deleteBookmark: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addFolder: (name: string) => void;
  removeFolder: (name: string) => void;
  setSelectedBookmark: (bookmark: LogBookmark | null) => void;
  moveBookmark: (bookmarkId: string, folderId: string) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    persist(
      (set, get) => ({
        bookmarks: [],
        folders: ['Favorites', 'Error Tracking', 'Performance'],
        isLoading: false,
        error: null,
        selectedBookmark: null,

        addBookmark: (bookmark) => {
          const newBookmark = {
            ...bookmark,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          set((state) => ({
            bookmarks: [...state.bookmarks, newBookmark],
          }));
        },

        updateBookmark: (id, updates) => {
          set((state) => ({
            bookmarks: state.bookmarks.map((bookmark) =>
              bookmark.id === id
                ? {
                    ...bookmark,
                    ...updates,
                    updated_at: new Date().toISOString(),
                  }
                : bookmark
            ),
          }));
        },

        deleteBookmark: (id) => {
          set((state) => ({
            bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
          }));
        },

        toggleFavorite: (id) => {
          set((state) => ({
            bookmarks: state.bookmarks.map((bookmark) =>
              bookmark.id === id
                ? { ...bookmark, is_favorite: !bookmark.is_favorite }
                : bookmark
            ),
          }));
        },

        addFolder: (name) => {
          set((state) => ({
            folders: [...state.folders, name],
          }));
        },

        removeFolder: (name) => {
          set((state) => ({
            folders: state.folders.filter((folder) => folder !== name),
          }));
        },

        setSelectedBookmark: (bookmark) => {
          set({ selectedBookmark: bookmark });
        },

        moveBookmark: (bookmarkId, folderId) => {
          set((state) => ({
            bookmarks: state.bookmarks.map((bookmark) =>
              bookmark.id === bookmarkId
                ? { ...bookmark, folder: folderId }
                : bookmark
            ),
          }));
        },
      }),
      {
        name: 'logify-bookmarks-storage',
      }
    )
  )
);
