import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface WatchedMovie {
  id: number;
  title: string;
  watchedAt: string;
  rating?: number;
  review?: string;
  posterPath?: string;
}

export interface UnavailableMovie {
  id: number;
  title: string;
  markedAt: string;
  reason?: string;
  posterPath?: string;
}

export interface UserProgress {
  userId: string;
  email: string;
  watchedMovies: { [key: string]: WatchedMovie };
  unavailableMovies: { [key: string]: UnavailableMovie };
  totalWatched: number;
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProgress({
            userId: user.uid,
            email: data.email,
            watchedMovies: data.watchedMovies || {},
            unavailableMovies: data.unavailableMovies || {},
            totalWatched: Object.keys(data.watchedMovies || {}).length
          });
        } else {
          // Initialize user document if it doesn't exist
          setDoc(doc.ref, {
            email: user.email,
            watchedMovies: {},
            unavailableMovies: {},
            createdAt: new Date().toISOString()
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching progress:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsWatched = async (
    movieId: number,
    movieTitle: string,
    rating?: number,
    review?: string,
    posterPath?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          watchedMovies: {},
          unavailableMovies: {},
          createdAt: new Date().toISOString()
        });
      }

      const data = userDoc.exists() ? userDoc.data() : {};
      const watchedMovies = data.watchedMovies || {};
      const unavailableMovies = data.unavailableMovies || {};

      // Remove from unavailable if it was there
      if (unavailableMovies[movieId]) {
        delete unavailableMovies[movieId];
      }

      watchedMovies[movieId] = {
        id: movieId,
        title: movieTitle,
        watchedAt: new Date().toISOString(),
        ...(rating && { rating }),
        ...(review && { review }),
        ...(posterPath && { posterPath })
      };

      await updateDoc(userRef, {
        watchedMovies,
        unavailableMovies,
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking movie as watched:', error);
      throw error;
    }
  };

  const markAsUnavailable = async (
    movieId: number,
    movieTitle: string,
    reason?: string,
    posterPath?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          watchedMovies: {},
          unavailableMovies: {},
          createdAt: new Date().toISOString()
        });
      }

      const data = userDoc.exists() ? userDoc.data() : {};
      const unavailableMovies = data.unavailableMovies || {};
      const watchedMovies = data.watchedMovies || {};

      // Remove from watched if it was there
      if (watchedMovies[movieId]) {
        delete watchedMovies[movieId];
      }

      unavailableMovies[movieId] = {
        id: movieId,
        title: movieTitle,
        markedAt: new Date().toISOString(),
        ...(reason && { reason }),
        ...(posterPath && { posterPath })
      };

      await updateDoc(userRef, {
        unavailableMovies,
        watchedMovies,
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking movie as unavailable:', error);
      throw error;
    }
  };

  const removeMovieStatus = async (movieId: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const data = userDoc.data();
      const watchedMovies = { ...data.watchedMovies } || {};
      const unavailableMovies = { ...data.unavailableMovies } || {};

      delete watchedMovies[movieId];
      delete unavailableMovies[movieId];

      await updateDoc(userRef, {
        watchedMovies,
        unavailableMovies,
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing movie status:', error);
      throw error;
    }
  };

  return { progress, loading, markAsWatched, markAsUnavailable, removeMovieStatus };
}