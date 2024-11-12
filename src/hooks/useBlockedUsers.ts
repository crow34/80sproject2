import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useBlockedUsers() {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setBlockedUsers(doc.data().blockedUsers || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const blockUser = async (userId: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        blockedUsers: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        blockedUsers: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  return {
    blockedUsers,
    loading,
    blockUser,
    unblockUser,
    isBlocked: (userId: string) => blockedUsers.includes(userId)
  };
}