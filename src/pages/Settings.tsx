import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { User, Mail, Lock, Save, Shield } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        bio,
        website,
        lastUpdated: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !currentPassword || !newEmail) return;

    setSaving(true);
    setMessage(null);

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        lastUpdated: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Email updated successfully!' });
      setNewEmail('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error('Error updating email:', error);
      setMessage({ 
        type: 'error', 
        text: error.code === 'auth/wrong-password' 
          ? 'Incorrect password'
          : 'Failed to update email. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword || newPassword !== confirmPassword) return;

    setSaving(true);
    setMessage(null);

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.code === 'auth/wrong-password' 
          ? 'Incorrect current password'
          : 'Failed to update password. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-red-500">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">Current Email</label>
              <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{user?.email}</span>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">Website</label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://your-website.com"
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Email Section */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Update Email
            </h2>

            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium mb-2">New Email</label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="currentPasswordEmail" className="block text-sm font-medium mb-2">Current Password</label>
              <input
                id="currentPasswordEmail"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdateEmail}
                disabled={saving || !newEmail || !currentPassword}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Updating...' : 'Update Email'}</span>
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </h2>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdatePassword}
                disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}