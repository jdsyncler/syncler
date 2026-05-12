import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL ERROR:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[150px] animate-pulse" />
            <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-blue-900/5 blur-[120px] animate-pulse" />
          </div>

          <div className="glass p-12 rounded-[48px] border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-white/10">
              <AlertCircle size={40} className="text-primary animate-pulse" />
            </div>

            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">Something Went Wrong</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-10 leading-relaxed">
              The application encountered an unexpected runtime error. Your audio session has been terminated for safety.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-primary text-black font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
              >
                <RefreshCcw size={18} />
                <span>Reload Stream</span>
              </button>
              
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-white/5 text-zinc-400 font-black rounded-2xl hover:bg-white/10 transition-all border border-white/5 uppercase tracking-widest text-xs"
              >
                <Home size={18} />
                <span>Reset Local Data</span>
              </button>
            </div>
            
            <p className="mt-12 text-zinc-800 text-[10px] font-black uppercase tracking-[0.4em]">Syncler Stability Protocol v2.1</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
