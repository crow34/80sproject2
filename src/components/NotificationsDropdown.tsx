import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageSquare, UserPlus, Check } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationContent = (notification: any) => {
    const userEmail = notification.fromUserEmail.split('@')[0];
    
    switch (notification.type) {
      case 'like':
        return (
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span>
              <Link to={`/profile/${notification.fromUserId}`} className="font-bold hover:text-red-400">
                {userEmail}
              </Link>{' '}
              liked your post
            </span>
          </div>
        );
      case 'comment':
        return (
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>
              <Link to={`/profile/${notification.fromUserId}`} className="font-bold hover:text-red-400">
                {userEmail}
              </Link>{' '}
              commented on your post
            </span>
          </div>
        );
      case 'follow':
        return (
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-green-500" />
            <span>
              <Link to={`/profile/${notification.fromUserId}`} className="font-bold hover:text-red-400">
                {userEmail}
              </Link>{' '}
              started following you
            </span>
          </div>
        );
      case 'friend_request':
        return (
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-purple-500" />
            <span>
              <Link to={`/profile/${notification.fromUserId}`} className="font-bold hover:text-red-400">
                {userEmail}
              </Link>{' '}
              sent you a friend request
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 hover:bg-gray-800 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-red-500 hover:text-red-400 flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${
                    !notification.read ? 'bg-gray-800/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {getNotificationContent(notification)}
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}