import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert('Check your email for confirmation!');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-900/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full px-8 py-10 glass rounded-[32px] border border-white/10 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-5xl font-black tracking-tighter text-gradient mb-2"
          >
            SYNCLER
          </motion.h1>
          <p className="text-zinc-400 font-medium">
            {isSignUp ? 'Create your account' : 'Welcome back, listener'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-green-400 text-black font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>{isSignUp ? 'Sign Up' : 'Continue'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center space-y-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-zinc-400 hover:text-white text-sm transition-colors font-medium flex items-center space-x-2"
          >
            {isSignUp ? (
              <>
                <LogIn size={16} />
                <span>Already have an account? Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Don't have an account? Sign Up</span>
              </>
            )}
          </button>
          
          {!isSignUp && (
            <button className="text-zinc-500 hover:text-white text-xs transition-colors font-medium uppercase tracking-widest">
              Forgot your password?
            </button>
          )}
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-zinc-600 text-xs tracking-widest uppercase font-bold">
          Private Streaming Network &bull; v1.1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
