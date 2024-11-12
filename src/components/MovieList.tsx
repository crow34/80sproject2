import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { useProgress } from '../hooks/useProgress';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { MovieStatusButton } from './MovieStatusButton';

interface MovieListProps {
  year: number;
}

export function MovieList({ year }: MovieListProps) {
  const [page, setPage] = useState(1);
  const { movies, loading, error, hasMore } = useMovies(year, page);
  const { progress } = useProgress();
  const loader = useRef(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  useIntersectionObserver(loader, handleObserver);

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
      </div>
    );
  }

  if (movies.length === 0 && !loading) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>No horror movies found for {year}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="relative group">
            <Link
              to={`/movie/${movie.id}`}
              className="block"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Film className="w-12 h-12 text-red-500/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-sm font-bold line-clamp-2">{movie.title}</h3>
                    <p className="text-gray-300 text-xs mt-1">
                      {movie.release_date?.split('-')[0]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            <div className="absolute top-2 right-2 z-10">
              <MovieStatusButton
                movieId={movie.id}
                movieTitle={movie.title}
                posterPath={movie.poster_path}
              />
            </div>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Film className="w-8 h-8 animate-spin text-red-500" />
        </div>
      )}
      
      <div ref={loader} className="h-4" />
    </>
  );
}