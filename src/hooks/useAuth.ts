'use client';

import { useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const ADMIN_WHITELIST = ['initbtn@gmail.com', 'waffle.dominic@gmail.com'];

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        const normalized = currentUser.email.trim().toLowerCase();
        setIsAdmin(ADMIN_WHITELIST.includes(normalized));
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (e) {
          console.error('Failed to get user idToken:', e);
          setIdToken(null);
        }
      } else {
        setIsAdmin(false);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-In Error:', err);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIdToken(null);
    } catch (err) {
      console.error('Sign-Out Error:', err);
    }
  };

  return {
    user,
    loading,
    isAdmin,
    idToken,
    loginWithGoogle,
    logout,
  };
}
