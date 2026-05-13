import { 
  Home, Search, Library, PlusSquare, 
  LogOut, X, ListMusic, Upload, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isMobile, onClose, playlists = [], createPlaylist }) => {
  const { signOut } = useAuth();
  
  const mainNav = [
    { icon: Home, label: 'Home', id: 'library' },
    { icon: Search, label: 'Search', id: 'search' },
    { icon: Library, label: 'Your Library', id: 'playlists' },
  ];

  const collectionNav = [
    { icon: PlusSquare, label: 'Create Playlist', id: 'create', action: () => createPlaylist && createPlaylist('New Playlist') },
    { icon: Upload, label: 'Bulk Import', id: 'import' },
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
    }
  };

  const SidebarContent = (
    <div className={`
      ${isMobile ? 'w-[300px] h-full m-0 rounded-none' : 'w-[280px] h-[calc(100vh-48px)] glass-panel'} 
      flex flex-col relative z-50 overflow-hidden shadow-2xl transition-all duration-700
    `}>
      {/* Branding */}
      <div className="p-10 pb-12 relative overflow-hidden">
        {/* Ambient background glow for branding */}
        <div className="absolute top-0 left-0 w-full h-full bg-spotify-green/5 blur-[50px] pointer-events-none opacity-50" />
        
        <div className="flex flex-col items-center space-y-4 relative z-10 group cursor-pointer">
          <div className="h-24 w-24 overflow-hidden flex items-center justify-center transition-all duration-700">
            <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter text-white leading-tight">SYNCLER</h1>
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center justify-center space-x-2 mt-1"
            >
              <div className="w-1 h-1 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(29,185,84,0.8)]" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.6em]">
                By <span className="text-spotify-green">JD</span>
              </p>
            </motion.div>
          </div>
        </div>
        
        {isMobile && (
          <button onClick={onClose} className="absolute top-10 right-8 p-3 hover:bg-white/10 rounded-full transition-all text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-10">
        {/* Main Navigation */}
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
                <motion.div layoutId="active-nav" className="absolute inset-0 bg-gradient-to-r from-spotify-green/10 to-transparent pointer-events-none" />
              )}
              <item.icon size={24} className={`transition-all duration-500 ${activeTab === item.id ? 'text-spotify-green scale-110' : 'group-hover:text-white'}`} />
              <span className="text-sm font-bold tracking-tight">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Collections */}
        <div className="space-y-6">
          <p className="px-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Collection</p>
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
                  activeTab === item.id 
                    ? 'bg-white/10 text-white shadow-glass-soft' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`transition-all duration-500 ${
                  activeTab === item.id ? 'text-spotify-green' : 'text-zinc-500 group-hover:text-white'
                }`}>
                   <item.icon size={22} />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Playlists List */}
        <div className="space-y-4 px-5 pb-8 border-t border-white/5 pt-8">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Playlists</p>
            <PlusSquare size={14} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="space-y-2">
            {playlists.length === 0 ? (
               <div className="py-4 text-center glass-panel border-dashed border-white/5 opacity-40">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">No playlists</p>
               </div>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    setActiveTab('playlists');
                    if (isMobile) onClose();
                  }}
                  className="w-full text-left py-2.5 px-2 text-sm font-bold text-zinc-500 hover:text-white transition-all truncate hover:translate-x-1"
                >
                  {playlist.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 mt-auto">
        <div className="p-5 glass-panel border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all duration-500">
          <div className="flex items-center space-x-4">
            <div className="text-left">
              <p className="text-sm font-black text-white leading-tight">JD</p>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-spotify-green tracking-widest">PRO</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-500"
            title="Log Out"
          >
             <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          />
          <motion.div 
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 h-full"
          >
            {SidebarContent}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return SidebarContent;
};

export default Sidebar;
