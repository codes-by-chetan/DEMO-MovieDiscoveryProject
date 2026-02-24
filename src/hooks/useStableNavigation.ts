import { useRef, useCallback } from 'react';

/**
 * Hook to debounce and stabilize navigation to prevent
 * React Native Fabric mounting layer exceptions
 */
export const useStableNavigation = () => {
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationInProgressRef = useRef(false);

  const debounceNavigation = useCallback(
    (callback: () => void, delay: number = 100) => {
      // Clear any pending navigation
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // If navigation is in progress, wait before allowing another
      if (navigationInProgressRef.current) {
        console.warn('[Navigation] Navigation already in progress, queuing');
        navigationTimeoutRef.current = setTimeout(callback, delay);
        return;
      }

      navigationInProgressRef.current = true;

      navigationTimeoutRef.current = setTimeout(() => {
        navigationInProgressRef.current = false;
        navigationTimeoutRef.current = null;
      }, delay);

      callback();
    },
    [],
  );

  const cleanup = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    navigationInProgressRef.current = false;
  }, []);

  return { debounceNavigation, cleanup };
};
