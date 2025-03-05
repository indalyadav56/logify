import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error } = useAuthStore();

  useEffect(() => {
    // Check if we have a token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated) {
      // If we have a token but not authenticated, update the store
      useAuthStore.setState({
        token: storedToken,
        isAuthenticated: true,
      });
    }
  }, [isAuthenticated]);

  return {
    user,
    token,
    isAuthenticated: Boolean(token), // Derive authentication status from token
    isLoading,
    error,
  };
};
