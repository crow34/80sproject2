import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { useMessages } from '../hooks/useMessages';
import { Film, Trophy, Users, MessageCircle, X } from 'lucide-react';
import { Loader } from '../components/Loader';
import { Navigation } from '../components/Navigation';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';

export function Progress() {
  const { progress, loading: progressLoading } = useProgress();
  const { feed, loading: feedLoading } = useSocialFeed();
  const { messages, loading: messagesLoading, addMessage } = useMessages();

  if (progressLoading || feedLoading || messagesLoading) return <Loader />;

  const totalMovies = 100; // This should be calculated based on actual data
  const progressPercentage = progress ? (progress.totalWatched / totalMovies) * 100 : 0;
  const unavailableCount = progress ? Object.keys(progress.unavailableMovies || {}).length : 0;

  return (
    <div className="min-h-screen bg-black text-red-500">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-shadow-glow">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Film className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Movies Watched</h3>
              </div>
              <p className="text-4xl font-bold">{progress?.totalWatched || 0}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <X className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Unavailable</h3>
              </div>
              <p className="text-4xl font-bold">{unavailableCount}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Trophy className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Completion</h3>
              </div>
              <p className="text-4xl font-bold">{progressPercentage.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Global Rank</h3>
              </div>
              <p className="text-4xl font-bold">#1</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Watched & Unavailable Movies */}
          <div className="lg:col-span-2 space-y-8">
            {/* Watched Movies */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recently Watched</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.values(progress?.watchedMovies || {})
                  .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
                  .slice(0, 8)
                  .map((movie) => (
                    <div key={movie.id} className="bg-gray-900 rounded-lg overflow-hidden">
                      {movie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                          <Film className="w-12 h-12 text-red-500/50" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-sm line-clamp-1">{movie.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(movie.watchedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Unavailable Movies */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Unavailable Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.values(progress?.unavailableMovies || {})
                  .sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime())
                  .slice(0, 8)
                  .map((movie) => (
                    <div key={movie.id} className="bg-gray-900 rounded-lg overflow-hidden">
                      {movie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover opacity-50"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                          <Film className="w-12 h-12 text-red-500/50" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-sm line-clamp-1">{movie.title}</h3>
                        {movie.reason && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {movie.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Messages */}
            <div>
              <div className="flex items-center mb-6">
                <MessageCircle className="w-6 h-6 mr-2" />
                <h2 className="text-2xl font-bold">Your Messages</h2>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="mb-4 max-h-96 overflow-y-auto">
                  <MessageList messages={messages} />
                </div>
                <MessageInput onSend={addMessage} />
              </div>
            </div>
          </div>

          {/* Right Column: Social Feed */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Community Activity</h2>
            <div className="space-y-4">
              {feed.slice(0, 10).map((item, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">
                    {item.email.split('@')[0]} watched
                  </p>
                  <p className="font-bold">{item.movie.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}