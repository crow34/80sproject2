import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface TimelinePost {
  id: string;
  userId: string;
  userEmail: string;
  content: string;
  createdAt: Date;
  likes: string[];
  comments: Comment[];
  movieId?: number;
  movieTitle?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  content: string;
  createdAt: Date;
}

export function useTimeline(userId?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (isInitial = false) => {
    if (!hasMore && !isInitial) return;

    try {
      const postsRef = collection(db, 'timeline');
      let q = query(
        postsRef,
        ...(userId ? [where('userId', '==', userId)] : []),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, hasMore]);

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  const addPost = async (content: string, movieId?: number, movieTitle?: string) => {
    if (!user) return;

    try {
      const newPost = {
        userId: user.uid,
        userEmail: user.email,
        content,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        ...(movieId && { movieId }),
        ...(movieTitle && { movieTitle })
      };

      const docRef = await addDoc(collection(db, 'timeline'), newPost);
      
      // Optimistic update
      setPosts(prev => [{
        id: docRef.id,
        ...newPost,
        createdAt: new Date(),
        likes: [],
        comments: []
      } as TimelinePost, ...prev]);

    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      const comment = {
        id: crypto.randomUUID(),
        userId: user.uid,
        userEmail: user.email,
        content,
        createdAt: new Date()
      };

      const postRef = doc(db, 'timeline', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      // Optimistic update
      setPosts(prev => 
        prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, comment]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'timeline', postId);
      const post = posts.find(p => p.id === postId);
      
      if (!post) return;

      const isLiked = post.likes.includes(user.uid);
      
      // Optimistic update
      setPosts(prev => 
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: isLiked 
                ? p.likes.filter(id => id !== user.uid)
                : [...p.likes, user.uid]
            };
          }
          return p;
        })
      );

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  return {
    posts,
    loading,
    hasMore,
    loadMore: () => loadPosts(false),
    addPost,
    addComment,
    toggleLike
  };
}