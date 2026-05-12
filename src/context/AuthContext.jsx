import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Single allowed email — hardcoded for private single-user access
const ALLOWED_EMAIL = "jd.syncler@gmail.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        // Verify the user is the allowed email
        if (ALLOWED_EMAIL && currentSession.user.email !== ALLOWED_EMAIL) {
          // Unauthorized user — sign them out
          supabase.auth.signOut();
          setUser(null);
          setSession(null);
        } else {
          setUser(currentSession.user);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          // Verify the user is the allowed email
          if (ALLOWED_EMAIL && currentSession.user.email !== ALLOWED_EMAIL) {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
          } else {
            setUser(currentSession.user);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    // Pre-check: is this the allowed email?
    if (ALLOWED_EMAIL && email !== ALLOWED_EMAIL) {
      return { error: { message: 'Unauthorized — access denied.' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    // Double-check after sign in
    if (ALLOWED_EMAIL && data.user?.email !== ALLOWED_EMAIL) {
      await supabase.auth.signOut();
      return { error: { message: 'Unauthorized — access denied.' } };
    }

    return { data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
