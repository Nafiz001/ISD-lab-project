import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { ADMIN_EMAILS, ADMIN_CREDENTIALS } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        // Check if user is admin
        const isAdmin = ADMIN_EMAILS.includes(user.email);
        
        setUser({ ...user, ...userData, isAdmin });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper function to validate admin credentials
  const validateAdminCredentials = (email, password) => {
    return ADMIN_CREDENTIALS.some(admin => 
      admin.email === email && admin.password === password
    );
  };

  // Helper function to check if email is admin (for Google sign-in)
  const isAdminEmail = (email) => {
    return ADMIN_EMAILS.includes(email);
  };

  const signup = async (email, password, name) => {
    // Check if trying to sign up with admin email
    if (isAdminEmail(email)) {
      // Validate admin credentials
      if (!validateAdminCredentials(email, password)) {
        throw new Error('Invalid admin credentials. Please use the correct admin password.');
      }
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      
      // Check if user is admin
      const isAdmin = isAdminEmail(email);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        isAdmin,
        createdAt: new Date()
      });

      return user;
    } catch (error) {
      // Handle admin email already in use
      if (error.code === 'auth/email-already-in-use' && isAdminEmail(email)) {
        throw new Error('Admin account already exists. Please login instead with your admin credentials.');
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    // For admin emails, first try Firebase authentication
    // Then validate if it's a legitimate admin login
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // If it's an admin email, ensure they're using the correct admin password
      if (isAdminEmail(email)) {
        if (!validateAdminCredentials(email, password)) {
          // Sign out the user since they used wrong admin password
          await signOut(auth);
          throw new Error('Invalid admin credentials. Please use the correct admin password.');
        }
      }
      
      return result;
    } catch (error) {
      // If it's an admin email and Firebase auth failed, check if it's because
      // they need to create an account with the admin password
      if (isAdminEmail(email) && error.code === 'auth/invalid-login-credentials') {
        if (validateAdminCredentials(email, password)) {
          // Admin credentials are correct but account doesn't exist, suggest signup
          throw new Error('Admin account not found. Please sign up with your admin credentials first.');
        }
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    
    // Create or update user document in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        isAdmin,
        createdAt: new Date()
      });
    }

    return user;
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    signup,
    login,
    signInWithGoogle,
    resetPassword,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
