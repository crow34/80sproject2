import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { useAdmin } from '../hooks/useAdmin';
import { Ban, Trash2, Send, Shield, ShieldOff, RefreshCw } from 'lucide-react';
import { Loader } from '../components/Loader';

export function Admin() {
  const { users, loading, error, banUser, deleteUser, sendMessage, makeAdmin, removeAdmin, refresh } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) return;

    try {
      setSending(true);
      await sendMessage(selectedUser, messageContent);
      setMessageContent('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">{error}</p>
          <button
            onClick={refresh}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-red-500">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={refresh}
            className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Movies Watched</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                  <th className="px-6 py-3 text-left">Last Active</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        user.role === 'admin' ? 'bg-red-600/20 text-red-400' : 'bg-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{user.totalWatched || 0}</td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {user.lastActivity 
                        ? new Date(user.lastActivity).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        user.banned ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'
                      }`}>
                        {user.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => banUser(user.uid, !user.banned)}
                          className="p-1 hover:bg-gray-700 rounded"
                          title={user.banned ? 'Unban User' : 'Ban User'}
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user.uid);
                            setMessageContent('');
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                          title="Send Message"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => removeAdmin(user.uid)}
                            className="p-1 hover:bg-gray-700 rounded"
                            title="Remove Admin"
                          >
                            <ShieldOff className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => makeAdmin(user.uid)}
                            className="p-1 hover:bg-gray-700 rounded"
                            title="Make Admin"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                              deleteUser(user.uid);
                            }
                          }}
                          className="p-1 hover:bg-gray-700 rounded text-red-500"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Send Message</h2>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write your message..."
                className="w-full bg-gray-800 rounded-lg p-4 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageContent.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}