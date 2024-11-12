import { useState, useEffect } from 'react';
import { AdminService, AdminUser } from '../lib/admin';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await AdminService.getUsers();
      setUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string, banned: boolean) => {
    try {
      await AdminService.banUser(userId, banned);
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, banned } : user
      ));
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await AdminService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.uid !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const sendMessage = async (userId: string, content: string) => {
    try {
      await AdminService.sendMessage(userId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      await AdminService.makeAdmin(userId);
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, role: 'admin' } : user
      ));
    } catch (error) {
      console.error('Error making user admin:', error);
      throw error;
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      await AdminService.removeAdmin(userId);
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, role: 'user' } : user
      ));
    } catch (error) {
      console.error('Error removing admin:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    error,
    banUser,
    deleteUser,
    sendMessage,
    makeAdmin,
    removeAdmin,
    refresh: loadUsers
  };
}