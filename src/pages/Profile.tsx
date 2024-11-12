import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Film, Users, Heart, Calendar } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Timeline } from '../components/Timeline';
import { Loader } from '../components/Loader';

export function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { profile, loading } = useProfile(userId || '');

  if (loading) return <Loader />;

  // Show registration prompt for non-authenticated users
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <Users className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-shadow-glow">Join the Community</h1>
          <p className="text-lg mb-6">
            Register or log in to view user profiles and participate in the 80s Horror Challenge.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === userId;

  return (
    <div className="min-h-screen bg-black text-red-500">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-shadow-glow">
                  {profile.email.split('@')[0]}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Film className="w-4 h-4 mr-1" />
                    {Object.keys(profile.watchedMovies).length} movies watched
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{profile.followers?.length || 0}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{profile.following?.length || 0}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">
                {((Object.keys(profile.watchedMovies).length / 100) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Challenge Progress</div>
            </div>
          </div>
        </div>

        {/* Watched Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.values(profile.watchedMovies).map((movie: any) => (
            <div key={movie.id} className="bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-sm mb-2 line-clamp-1">{movie.title}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <Heart className="w-4 h-4 mr-1" />
                  {movie.rating || 'Not rated'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}