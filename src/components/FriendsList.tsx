import React from 'react';
import { Link } from 'react-router-dom';
import { Film, UserMinus } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';

export function FriendsList() {
  const { friends, removeFriend } = useFriends();

  if (friends.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Friends</h2>
        <p className="text-gray-400">No friends yet. Start by searching for users!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      <div className="space-y-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
          >
            <Link
              to={`/profile/${friend.id}`}
              className="flex items-center space-x-3 hover:text-red-400"
            >
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.email}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-xl">
                    {friend.email[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold">{friend.email.split('@')[0]}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <Film className="w-4 h-4 mr-1" />
                  <span>{friend.watchedCount} movies watched</span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => removeFriend(friend.id)}
              className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
            >
              <UserMinus className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}