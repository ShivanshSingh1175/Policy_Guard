import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Hardcoded config for testing - will use env vars if available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDd--aH-CUOIqpGqI19EKnD5zELazXc2qA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "policyguard-49695.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "policyguard-49695",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "policyguard-49695.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "980469529435",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:980469529435:web:acd0e1e273dbd14496787e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C8QL5P4YQD",
};

// Debug: Log config to verify environment variables are loaded
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firebase Auth Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google Sign-In. Please contact support.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in popup is already open.');
    }
    
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
