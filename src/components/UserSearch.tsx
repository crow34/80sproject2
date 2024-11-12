import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useFriends } from '../hooks/useFriends';
import { Link } from 'react-router-dom';

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const { results, loading, searchUsers } = useSearch();
  const { friends, sendFriendRequest } = useFriends();
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    setSentRequests(prev => new Set(prev).add(userId));
  };

  const isFriend = (userId: string) => friends.some(friend => friend.id === userId);
  const hasRequestSent = (userId: string) => sentRequests.has(userId);

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="bg-transparent text-white ml-2 focus:outline-none w-full"
        />
      </div>

      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-800"
                >
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.email}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-xl">
                          {user.email[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{user.email.split('@')[0]}</h3>
                      <p className="text-sm text-gray-400">
                        {user.watchedCount} movies watched
                      </p>
                    </div>
                  </Link>
                  {!isFriend(user.id) && (
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={hasRequestSent(user.id)}
                      className={`p-2 rounded-full ${
                        hasRequestSent(user.id)
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {hasRequestSent(user.id) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}