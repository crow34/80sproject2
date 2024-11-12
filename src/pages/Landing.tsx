import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skull, ArrowRight } from 'lucide-react';
import { fetchHorrorMovies, fetchMovieTrailer } from '../lib/tmdb';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

interface MovieWithTrailer extends Movie {
  trailerId?: string;
}

export function Landing() {
  const [movies, setMovies] = useState<MovieWithTrailer[]>([]);
  const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMoviesAndTrailers = async () => {
      try {
        const data = await fetchHorrorMovies(1, 1980);
        const moviesWithTrailers = await Promise.all(
          data.results.slice(0, 6).map(async (movie: Movie) => {
            try {
              const trailer = await fetchMovieTrailer(movie.id);
              return {
                ...movie,
                trailerId: trailer?.key
              };
            } catch (error) {
              console.error(`Error fetching trailer for movie ${movie.id}:`, error);
              return movie;
            }
          })
        );
        setMovies(moviesWithTrailers);
        if (moviesWithTrailers[0]?.trailerId) {
          setCurrentTrailer(moviesWithTrailers[0].trailerId);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoviesAndTrailers();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setCurrentTrailer((prev) => {
          const currentIndex = movies.findIndex(m => m.trailerId === prev);
          const nextIndex = (currentIndex + 1) % movies.length;
          return movies[nextIndex]?.trailerId || movies[0]?.trailerId;
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [movies]);

  return (
    <div className="min-h-screen bg-black text-red-500">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
        {currentTrailer && (
          <iframe
            className="w-full h-full object-cover"
            src={`https://www.youtube.com/embed/${currentTrailer}?autoplay=1&mute=1&loop=1&playlist=${currentTrailer}&controls=0&showinfo=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <Skull className="w-20 h-20 mb-6 animate-pulse" />
          <h1 className="text-6xl font-bold mb-4 text-shadow-glow">80s Horror Challenge</h1>
          <p className="text-xl mb-8 max-w-2xl px-4">
            Dare to watch every horror movie from the 1980s? Join the ultimate horror challenge
            and track your progress through the golden age of horror.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-colors"
            >
              Accept the Challenge <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Movies */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-8 text-center text-shadow-glow">
          Iconic 80s Horror Movies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="relative group overflow-hidden rounded-lg transform transition-transform hover:scale-105"
            >
              <div className="aspect-w-2 aspect-h-3">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">{movie.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-b from-black to-red-900/20 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-xl mb-8">
            Join hundreds of horror enthusiasts tracking their progress through the greatest
            decade in horror history.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold text-lg transition-colors"
          >
            Start Watching Now <ArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}