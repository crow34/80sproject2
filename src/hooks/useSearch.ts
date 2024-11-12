import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SearchResult {
  id: string;
  email: string;
  watchedCount: number;
  avatarUrl?: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff')
      );

      const snapshot = await getDocs(q);
      const searchResults: SearchResult[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        searchResults.push({
          id: doc.id,
          email: data.email,
          watchedCount: Object.keys(data.watchedMovies || {}).length,
          avatarUrl: data.avatarUrl
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, searchUsers };
}