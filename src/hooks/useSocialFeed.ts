import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WatchedMovie } from './useProgress';

export interface FeedItem {
  userId: string;
  email: string;
  movie: WatchedMovie;
  timestamp: string;
}

export function useSocialFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('lastActivity', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newFeed: FeedItem[] = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const watchedMovies = userData.watchedMovies || {};
        
        Object.values(watchedMovies).forEach((movie: any) => {
          newFeed.push({
            userId: doc.id,
            email: userData.email,
            movie,
            timestamp: movie.watchedAt
          });
        });
      });

      newFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setFeed(newFeed);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { feed, loading };
}