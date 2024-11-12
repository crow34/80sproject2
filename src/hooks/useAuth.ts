import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  error: Error | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        try {
          if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
              // Set up new user document
              await setDoc(userRef, {
                email: currentUser.email,
                createdAt: serverTimestamp(),
                role: 'user',
                watchedMovies: {},
                unavailableMovies: {},
                followers: [],
                following: [],
                bio: '',
                avatarUrl: '',
                lastActivity: serverTimestamp()
              });
              setIsAdmin(false);
            } else {
              // Update last activity and check admin status
              const userData = userDoc.data();
              await setDoc(userRef, { lastActivity: serverTimestamp() }, { merge: true });
              setIsAdmin(userData.role === 'admin');
            }
          } else {
            setIsAdmin(false);
          }
          
          setUser(currentUser);
          setError(null);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError(err instanceof Error ? err : new Error('Authentication error'));
          setUser(null);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      setError(err instanceof Error ? err : new Error('Authentication setup error'));
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { user, loading, isAdmin, error };
}