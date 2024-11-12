import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface FriendRequest {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface Friend {
  id: string;
  email: string;
  watchedCount: number;
  avatarUrl?: string;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (snapshot) => {
      if (!snapshot.exists()) {
        await setDoc(snapshot.ref, {
          email: user.email,
          friends: [],
          friendRequests: [],
          createdAt: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      const data = snapshot.data();
      const friendsList = data.friends || [];
      const requestsList = data.friendRequests || [];

      // Fetch friend details
      const friendPromises = friendsList.map(async (friendId: string) => {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (!friendDoc.exists()) return null;
        const friendData = friendDoc.data();
        return {
          id: friendDoc.id,
          email: friendData.email,
          watchedCount: Object.keys(friendData.watchedMovies || {}).length,
          avatarUrl: friendData.avatarUrl
        };
      });

      const resolvedFriends = (await Promise.all(friendPromises)).filter(Boolean) as Friend[];
      setFriends(resolvedFriends);
      setRequests(requestsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const sendFriendRequest = async (toUserId: string) => {
    if (!user) throw new Error('User not authenticated');

    const request: FriendRequest = {
      id: crypto.randomUUID(),
      from: user.uid,
      to: toUserId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const toUserRef = doc(db, 'users', toUserId);
    await updateDoc(toUserRef, {
      friendRequests: arrayUnion(request)
    });
  };

  const acceptFriendRequest = async (request: FriendRequest) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Add to friends list for both users
      const userRef = doc(db, 'users', user.uid);
      const fromUserRef = doc(db, 'users', request.from);

      await updateDoc(userRef, {
        friends: arrayUnion(request.from),
        friendRequests: arrayRemove(request)
      });

      await updateDoc(fromUserRef, {
        friends: arrayUnion(user.uid)
      });

      // Update local state
      const fromUserDoc = await getDoc(fromUserRef);
      if (fromUserDoc.exists()) {
        const fromUserData = fromUserDoc.data();
        setFriends(prev => [...prev, {
          id: request.from,
          email: fromUserData.email,
          watchedCount: Object.keys(fromUserData.watchedMovies || {}).length,
          avatarUrl: fromUserData.avatarUrl
        }]);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };

  const rejectFriendRequest = async (request: FriendRequest) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        friendRequests: arrayRemove(request)
      });
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', user.uid);
      const friendRef = doc(db, 'users', friendId);

      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });

      await updateDoc(friendRef, {
        friends: arrayRemove(user.uid)
      });

      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  return {
    friends,
    requests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  };
}