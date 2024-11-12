import { useState, useEffect, useCallback } from 'react';
import { fetchHorrorMovies } from '../lib/tmdb';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const movieCache: { [key: string]: { data: any; timestamp: number } } = {};

export function useMovies(year: number, page: number = 1) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const cacheKey = `${year}-${page}`;

  const loadMovies = useCallback(async () => {
    // Check cache first
    if (movieCache[cacheKey] && Date.now() - movieCache[cacheKey].timestamp < CACHE_DURATION) {
      setMovies(prev => page === 1 ? movieCache[cacheKey].data : [...prev, ...movieCache[cacheKey].data]);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      const data = await fetchHorrorMovies(page, year, controller.signal);
      const filteredResults = data.results.filter((movie: any) => 
        movie.poster_path && 
        movie.release_date && 
        new Date(movie.release_date).getFullYear() === year
      );

      if (page === 1) {
        setMovies(filteredResults);
      } else {
        setMovies(prev => [...prev, ...filteredResults]);
      }

      // Cache the results
      movieCache[cacheKey] = {
        data: filteredResults,
        timestamp: Date.now()
      };

      setHasMore(data.page < data.total_pages);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error loading movies:', error);
        setError('Failed to load movies');
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [year, page, cacheKey]);

  useEffect(() => {
    const cleanup = loadMovies();
    return () => {
      cleanup.then(abort => abort?.());
    };
  }, [loadMovies]);

  return { movies, loading, error, hasMore };
}