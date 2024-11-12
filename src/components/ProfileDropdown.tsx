import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProfileDropdownProps {
  onLogout: () => void;
}

export function ProfileDropdown({ onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg"
      >
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <span>{user.email?.split('@')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
          <Link
            to={`/profile/${user.uid}`}
            className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-800 text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}