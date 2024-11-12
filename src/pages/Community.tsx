import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Timeline } from '../components/Timeline';
import { UserSearch } from '../components/UserSearch';
import { FriendRequests } from '../components/FriendRequests';
import { FriendsList } from '../components/FriendsList';
import { useProgress } from '../hooks/useProgress';
import { Users, Trophy, Film } from 'lucide-react';

export function Community() {
  const { progress } = useProgress();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'leaderboard'>('feed');

  return (
    <div className="min-h-screen bg-black text-red-500">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-shadow-glow">Horror Community</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'feed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-red-500 hover:bg-gray-700'
              }`}
            >
              Social Feed
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'friends'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-red-500 hover:bg-gray-700'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'leaderboard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-red-500 hover:bg-gray-700'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && <Timeline />}
            {activeTab === 'friends' && (
              <div className="space-y-6">
                <UserSearch />
                <FriendRequests />
                <FriendsList />
              </div>
            )}
            {activeTab === 'leaderboard' && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  Top Horror Watchers
                </h2>
                <div className="space-y-4">
                  {/* Placeholder leaderboard data */}
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-red-500">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-bold">Horror Fan {index + 1}</p>
                          <p className="text-sm text-gray-400">
                            {80 - index * 5} movies watched
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Film className="w-5 h-5" />
                        <span>{90 - index * 5}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Your Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Movies Watched</span>
                  <span className="font-bold">{progress?.totalWatched || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completion</span>
                  <span className="font-bold">
                    {((progress?.totalWatched || 0) / 100 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Global Rank</span>
                  <span className="font-bold">#1</span>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Active Users</h2>
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                  >
                    <span>Horror Fan {index + 1}</span>
                    <span className="text-sm text-gray-400">Online</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}