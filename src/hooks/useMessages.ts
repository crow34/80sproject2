import { useState, useEffect } from 'react';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  userId: string;
  userEmail: string;
  content: string;
  createdAt: Date;
}

export function useMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, `users/${user.uid}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          content: data.content,
          createdAt: data.createdAt.toDate(),
        });
      });
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addMessage = async (content: string) => {
    if (!user) return;

    const messagesRef = collection(db, `users/${user.uid}/messages`);
    await addDoc(messagesRef, {
      userId: user.uid,
      userEmail: user.email,
      content,
      createdAt: serverTimestamp(),
    });
  };

  return { messages, loading, addMessage };
}