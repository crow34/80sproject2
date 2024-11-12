import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../lib/tmdb';
import { ArrowLeft, Play, Heart, Film, X, Check, AlertCircle, Ban } from 'lucide-react';
import { Loader } from '../components/Loader';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

export function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, markAsWatched, markAsUnavailable, removeMovieStatus } = useProgress();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [reason, setReason] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const movieId = Number(id);
  const isWatched = progress?.watchedMovies?.[movieId];
  const isUnavailable = progress?.unavailableMovies?.[movieId];

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) {
        setError('Invalid movie ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovieDetails(Number(id));
        setMovie(data);
      } catch (error) {
        console.error('Error loading movie:', error);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleMarkWatched = async () => {
    if (!movie) return;
    try {
      await markAsWatched(movie.id, movie.title, rating, review, movie.poster_path);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error marking movie as watched:', error);
    }
  };

  const handleMarkUnavailable = async () => {
    if (!movie) return;
    try {
      await markAsUnavailable(movie.id, movie.title, reason, movie.poster_path);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error marking movie as unavailable:', error);
    }
  };

  const handleRemoveStatus = async () => {
    if (!movie) return;
    try {
      await removeMovieStatus(movie.id);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error removing movie status:', error);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-black text-red-500">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-gray-900/80 text-red-500 px-4 py-2 rounded-lg hover:bg-gray-800"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        {movie.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
            <div className="w-64 flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-shadow-glow">{movie.title}</h1>
              <p className="text-lg mb-6 text-gray-300">{movie.overview}</p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPlayer(true)}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Play Now</span>
                </button>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                    isWatched
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : isUnavailable
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {isWatched ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Watched</span>
                    </>
                  ) : isUnavailable ? (
                    <>
                      <Ban className="w-5 h-5" />
                      <span>Unavailable</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Mark Status</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movie.credits.cast.slice(0, 8).map((actor) => (
                <div key={actor.id} className="bg-gray-900 rounded-lg overflow-hidden">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                      <Film className="w-12 h-12 text-red-500/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-white">{actor.name}</h3>
                    <p className="text-sm text-gray-400">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 bg-black z-50">
          <button
            onClick={() => setShowPlayer(false)}
            className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            <X className="w-6 h-6" />
          </button>
          <iframe
            src={`https://vidlink.pro/movie/${movie.id}`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}

      {/* Movie Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Update Movie Status</h2>
            
            <div className="space-y-6">
              {/* Watched Section */}
              <div>
                <h3 className="text-lg font-bold mb-4">Mark as Watched</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 ${rating >= star ? 'text-red-500' : 'text-gray-600'}`}
                        >
                          <Heart className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Review (Optional)</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full bg-gray-800 rounded p-2 text-white"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleMarkWatched}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Mark as Watched
                  </button>
                </div>
              </div>

              {/* Unavailable Section */}
              <div>
                <h3 className="text-lg font-bold mb-4">Mark as Unavailable</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Reason (Optional)</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-gray-800 rounded p-2 text-white"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleMarkUnavailable}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                  >
                    Mark as Unavailable
                  </button>
                </div>
              </div>

              {/* Remove Status */}
              {(isWatched || isUnavailable) && (
                <div>
                  <button
                    onClick={handleRemoveStatus}
                    className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
                  >
                    Remove Status
                  </button>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full border border-gray-600 text-gray-400 py-2 rounded hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}