import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface LogBookmark {
  id: string;
  log_id: string;
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
  fetchBookmarks: () => Promise<void>;
  addBookmark: (bookmark: Omit<LogBookmark, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBookmark: (id: string, updates: Partial<LogBookmark>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
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

        fetchBookmarks: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch('http://localhost:8080/v1/bookmarks', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch bookmarks');
            }

            const data = await response.json();
            set({ bookmarks: data, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              isLoading: false,
            });
          }
        },

        addBookmark: async (bookmark) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch('http://localhost:8080/v1/bookmarks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                log_id: bookmark.log_id,
                name: bookmark.name,
                description: bookmark.description,
                query: bookmark.query,
                color: bookmark.color,
                tags: bookmark.tags,
                folder: bookmark.folder,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to create bookmark');
            }

            const newBookmark = await response.json();
            set((state) => ({
              bookmarks: [...state.bookmarks, newBookmark],
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              isLoading: false,
            });
          }
        },

        updateBookmark: async (id, updates) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(`http://localhost:8080/v1/bookmarks/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update bookmark');
            }

            const updatedBookmark = await response.json();
            set((state) => ({
              bookmarks: state.bookmarks.map((bookmark) =>
                bookmark.id === id ? updatedBookmark : bookmark
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              isLoading: false,
            });
          }
        },

        deleteBookmark: async (id) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(`http://localhost:8080/v1/bookmarks/${id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to delete bookmark');
            }

            set((state) => ({
              bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              isLoading: false,
            });
          }
        },

        toggleFavorite: async (id) => {
          const bookmark = get().bookmarks.find((b) => b.id === id);
          if (bookmark) {
            await get().updateBookmark(id, { is_favorite: !bookmark.is_favorite });
          }
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
