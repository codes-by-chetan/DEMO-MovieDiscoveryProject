import {useCallback, useRef, useState, useEffect} from 'react';
import {Movie} from '../types/movie';

export type MovieFetcher = (page: number, signal?: AbortSignal) => Promise<{
  page: number;
  results: Movie[];
  total_pages: number;
}>;

const mergeUniqueById = (base: Movie[], incoming: Movie[]) => {
  const map = new Map<number, Movie>();
  [...base, ...incoming].forEach(movie => {
    map.set(movie.id, movie);
  });
  return Array.from(map.values());
};

export const usePaginatedMovies = (fetcher: MovieFetcher) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set<number>());
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadPage = useCallback(
    async (nextPage: number, mode: 'initial' | 'refresh' | 'append') => {
      if (loadingRef.current || fetchedPagesRef.current.has(nextPage)) {
        return;
      }

      loadingRef.current = true;
      if (mode === 'initial') {
        setInitialLoading(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }

      try {
        setError(null);
        
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();
        const response = await fetcher(nextPage, abortControllerRef.current.signal);

        // Don't update state if component unmounted
        if (!mountedRef.current) {
          return;
        }        

        setPage(response.page);
        setTotalPages(response.total_pages);
        fetchedPagesRef.current.add(response.page);
        setMovies(current =>
          mode === 'append'
            ? mergeUniqueById(current, response.results)
            : mergeUniqueById([], response.results),
        );
      } catch (caughtError) {
        // Don't update state if component unmounted
        if (!mountedRef.current) {
          return;
        }

        // Skip error state if request was cancelled
        if (caughtError instanceof Error && caughtError.message.includes('aborted')) {
          console.log('[usePaginatedMovies] Request cancelled');
          return;
        }
        
        const message = caughtError instanceof Error ? caughtError.message : 'Unable to fetch movies right now. Please try again.';
        setError(message);
      } finally {
        if (!mountedRef.current) {
          return;
        }

        loadingRef.current = false;
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [fetcher],
  );

  const resetAndLoad = useCallback(async () => {    
    fetchedPagesRef.current.clear();
    setPage(0);
    setTotalPages(1);
    await loadPage(1, 'initial');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    fetchedPagesRef.current.clear();
    await loadPage(1, 'refresh');
  }, [loadPage]);

  const loadNext = useCallback(async () => {
    if (page >= totalPages || loadingRef.current) {
      return;
    }

    await loadPage(page + 1, 'append');
  }, [loadPage, page, totalPages]);

  return {
    movies,
    page,
    totalPages,
    initialLoading,
    loadingMore,
    refreshing,
    error,
    loadNext,
    refresh,
    resetAndLoad,
  };
};
