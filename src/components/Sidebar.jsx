import React from 'react';
import { 
  Home, Search, Library, PlusSquare, 
  LogOut, X, ListMusic, Upload, Music, Sparkles, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isMobile, onClose, playlists = [], createPlaylist }) => {
  const { signOut } = useAuth();
  
  const mainNav = [
    { icon: Home, label: 'Explore', id: 'library' },
    { icon: Search, label: 'Search', id: 'search' },
    { icon: Library, label: 'Your Vault', id: 'playlists' },
  ];

  const collectionNav = [
    { icon: PlusSquare, label: 'New Playlist', id: 'create', action: () => createPlaylist?.('New Playlist') },
    { icon: Upload, label: 'Data Ingest', id: 'import' },
  ];

  const handleLogout = async () => {
    if (window.confirm("Disconnect from Syncler Core?")) {
      await signOut();
    }
  };

  const SidebarContent = (
    <div className={`
      ${isMobile ? 'w-[300px] h-full m-0 rounded-none' : 'w-[280px] h-[calc(100vh-48px)] glass-panel-premium'} 
      flex flex-col relative z-50 overflow-hidden shadow-2xl transition-all duration-700
    `}>
      {/* Branding */}
      <div className="p-10 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-spotify-green/5 blur-[50px] pointer-events-none" />
        
        <div className="flex flex-col items-center space-y-4 relative z-10 group cursor-pointer">
          <div className="h-20 w-20 overflow-hidden flex items-center justify-center transition-all duration-700 group-hover:scale-110">
            <img src="/logo.png" alt="logo" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,102,0.4)]" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter text-white italic leading-tight">SYNCLER</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <div className="w-1 h-1 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_#00ff66]" />
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.6em]">By <span className="text-spotify-green">JD</span></p>
            </div>
          </div>
        </div>
        
        {isMobile && (
          <button onClick={onClose} className="absolute top-8 right-8 p-3 glass-panel-premium text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-12">
        <nav className="space-y-2">
          {mainNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) onClose();
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-white/10 text-white shadow-glass-soft' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === item.id && (
                <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-gradient-to-r from-spotify-green/10 to-transparent pointer-events-none" />
              )}
              <item.icon size={22} className={`transition-all duration-500 ${activeTab === item.id ? 'text-spotify-green drop-shadow-[0_0_8px_#00ff66]' : 'group-hover:text-white'}`} />
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <p className="px-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Core Functions</p>
          <nav className="space-y-2">
            {collectionNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action();
                  else {
                    setActiveTab(item.id);
                    if (isMobile) onClose();
                  }
                }}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                  activeTab === item.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-spotify-cyan drop-shadow-[0_0_8px_#00f2ff]' : ''} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 px-5 pb-8">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Vault</p>
            <Sparkles size={12} className="text-spotify-green animate-pulse" />
          </div>
          <div className="space-y-2">
            {playlists.length > 0 ? playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActiveTab('playlists'); if (isMobile) onClose(); }}
                className="w-full text-left py-2 px-3 text-[10px] font-bold text-zinc-500 hover:text-spotify-green hover:translate-x-1 transition-all truncate uppercase tracking-widest"
              >
                {p.name}
              </button>
            )) : (
              <div className="py-8 text-center opacity-20"><Music size={32} className="mx-auto" /></div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <div className="p-4 glass-panel-premium flex items-center justify-between group">
          <div className="flex items-center space-x-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-spotify-green to-spotify-cyan flex items-center justify-center text-black font-black">JD</div>
             <div>
                <p className="text-xs font-black text-white">ADMIN</p>
                <div className="flex items-center space-x-1">
                   <div className="w-1 h-1 bg-spotify-green rounded-full" />
                   <p className="text-[8px] font-black text-spotify-green tracking-widest">ENCRYPTED</p>
                </div>
             </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} className="relative z-10 h-full">{SidebarContent}</motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return SidebarContent;
};

export default Sidebar;
