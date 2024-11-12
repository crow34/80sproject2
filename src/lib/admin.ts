import { doc, collection, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  banned: boolean;
  lastActivity?: string;
  totalWatched?: number;
}

export class AdminService {
  static async getUsers(): Promise<AdminUser[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      totalWatched: Object.keys(doc.data().watchedMovies || {}).length
    })) as AdminUser[];
  }

  static async banUser(uid: string, banned: boolean) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { banned });
  }

  static async deleteUser(uid: string) {
    // Delete user document
    await deleteDoc(doc(db, 'users', uid));

    // Delete user's posts
    const postsRef = collection(db, 'timeline');
    const postsQuery = query(postsRef, where('userId', '==', uid));
    const postsSnapshot = await getDocs(postsQuery);
    
    for (const postDoc of postsSnapshot.docs) {
      await deleteDoc(postDoc.ref);
    }

    // Delete user's notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(notificationsRef, where('toUserId', '==', uid));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    for (const notificationDoc of notificationsSnapshot.docs) {
      await deleteDoc(notificationDoc.ref);
    }
  }

  static async sendMessage(userId: string, content: string) {
    const messagesRef = collection(db, `users/${userId}/messages`);
    await addDoc(messagesRef, {
      content,
      fromAdmin: true,
      createdAt: new Date().toISOString()
    });
  }

  static async makeAdmin(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'admin' });
  }

  static async removeAdmin(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'user' });
  }
}