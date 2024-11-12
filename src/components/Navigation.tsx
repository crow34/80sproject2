import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, BarChart2, Users, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileDropdown } from './ProfileDropdown';

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-900 text-red-500 py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex space-x-8">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-2 ${
              isActive('/dashboard') ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/progress"
            className={`flex items-center space-x-2 ${
              isActive('/progress') ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Progress</span>
          </Link>
          <Link
            to="/community"
            className={`flex items-center space-x-2 ${
              isActive('/community') ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Community</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center space-x-2 ${
                isActive('/admin') ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationsDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
}