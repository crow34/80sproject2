import React from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import { Link } from 'react-router-dom';

export function FriendRequests() {
  const { requests, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const pendingRequests = requests.filter(req => req.status === 'pending');

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
          >
            <Link to={`/profile/${request.from}`} className="hover:text-red-400">
              {request.from}
            </Link>
            <div className="flex space-x-2">
              <button
                onClick={() => acceptFriendRequest(request)}
                className="p-2 bg-red-600 rounded-full hover:bg-red-700"
              >
                <UserPlus className="w-5 h-5" />
              </button>
              <button
                onClick={() => rejectFriendRequest(request)}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <UserMinus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}