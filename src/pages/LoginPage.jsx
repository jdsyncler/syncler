import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, Music, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-liquid-mesh opacity-20 animate-liquid-slow" />
        <div className="relative z-10 flex flex-col items-center space-y-6">
           <div className="relative">
             <div className="absolute inset-0 bg-spotify-green/20 blur-2xl rounded-full animate-pulse" />
             <Loader2 size={48} className="animate-spin text-spotify-green relative z-10" strokeWidth={3} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">Authenticating</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message);
      }
    } catch (err) {
      setError('System connection failure. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Immersive Liquid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-liquid-mesh opacity-30 animate-liquid-slow" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-spotify-green/10 blur-[150px] rounded-full animate-pulse-soft" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-soft" style={{ animationDelay: '-3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="h-28 w-28 bg-spotify-dark border border-white/10 rounded-[36px] mx-auto mb-8 flex items-center justify-center shadow-glass-strong overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-glass-shine opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/logo.png" alt="logo" className="w-full h-full object-cover relative z-10" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black tracking-tighter text-white mb-3"
          >
            SYNCLER
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center space-x-2"
          >
             <ShieldCheck size={12} className="text-spotify-green" />
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Secure Access Portal</p>
          </motion.div>
        </div>

        <div className="glass-panel p-12 border-white/10 shadow-glass-strong relative overflow-hidden">
          {/* Internal Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-spotify-green/20 to-transparent" />
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-10 bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-black p-5 rounded-2xl flex items-center space-x-4 uppercase tracking-widest shadow-glass-soft"
              >
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle size={20} className="flex-shrink-0" />
                </div>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Identity</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-spotify-green/5 blur-lg rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-spotify-green transition-all" size={20} strokeWidth={2.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or Username"
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-[24px] py-5 pl-16 pr-8 text-white focus:outline-none focus:border-spotify-green/30 focus:bg-white/10 transition-all font-black text-sm placeholder:text-zinc-700 tracking-tight"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Credential</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-spotify-green/5 blur-lg rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-spotify-green transition-all" size={20} strokeWidth={2.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-[24px] py-5 pl-16 pr-16 text-white focus:outline-none focus:border-spotify-green/30 focus:bg-white/10 transition-all font-black text-sm placeholder:text-zinc-700 tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-all hover:scale-110"
                >
                  {showPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-spotify w-full py-5 font-black text-xs uppercase tracking-[0.3em] shadow-glass-strong disabled:opacity-50 mt-6 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                  <span>Synchronizing...</span>
                </div>
              ) : (
                <span>Access Vault</span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-white/5 text-center">
             <div className="flex flex-col space-y-2">
               <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">
                 Authorized Access Only
               </p>
               <p className="text-zinc-800 text-[8px] font-black uppercase tracking-[0.2em]">
                 Syncler Core Engine v4.2.0-Liquid
               </p>
             </div>
          </div>
        </div>
        
        {/* Footnote */}
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-8 text-center text-zinc-700 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          &copy; 2026 Syncler Digital Systems. All Rights Reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
