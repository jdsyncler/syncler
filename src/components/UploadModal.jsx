import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Loader2, CheckCircle, AlertCircle, Upload, Database, Terminal } from 'lucide-react';
import { songService } from '../services/songService';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, existingSongs = [] }) => {
  const [inputText, setInputText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  
  const handleImport = async () => {
    if (!inputText.trim()) {
      setError('Input stream empty. Please provide data.');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccessCount(0);

    try {
      const lines = inputText.split('\n').filter(line => line.trim());
      const songsToImport = [];
      const duplicateUrls = new Set(existingSongs.map(s => s.url));

      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 2) continue;
        const [song_name, url] = parts;
        if (!song_name || !url || duplicateUrls.has(url)) continue;
        songsToImport.push({ song_name, url });
        duplicateUrls.add(url);
      }

      if (songsToImport.length === 0) {
        setError('Zero unique tracks identified for deployment.');
        setIsImporting(false);
        return;
      }

      await songService.bulkImport(songsToImport);
      setSuccessCount(songsToImport.length);
      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => { setInputText(''); setSuccessCount(0); onClose(); }, 2000);
    } catch (err) {
      setError(err.message || 'Deployment failure.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="max-w-3xl w-full glass-panel-premium p-8 lg:p-16 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file?.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = (ev) => setInputText(prev => prev + (prev ? '\n' : '') + ev.target.result);
                reader.readAsText(file);
              }
            }}
          >
            {/* Cinematic Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database size={200} />
            </div>

            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-[24px] bg-white text-black flex items-center justify-center shadow-2xl">
                  <Terminal size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter">DATA INGESTION</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">SYNCLER DATABASE ENGINE V2</p>
                </div>
              </div>
              <button onClick={onClose} className="h-12 w-12 glass-panel-premium flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                <X size={24} />
              </button>
            </div>

            {successCount > 0 ? (
              <div className="py-24 text-center space-y-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-24 w-24 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto border border-spotify-green/30 shadow-[0_0_30px_rgba(0,255,102,0.3)]">
                  <CheckCircle size={48} className="text-spotify-green" />
                </motion.div>
                <div>
                  <h3 className="text-4xl font-black italic glow-text-green">DEPLOYMENT SUCCESS</h3>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">{successCount} TRACKS INTEGRATED INTO CORE</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="relative">
                  {isDragging && (
                    <div className="absolute inset-0 z-50 bg-spotify-green/10 border-2 border-dashed border-spotify-green/40 rounded-[32px] flex flex-col items-center justify-center backdrop-blur-md">
                      <Upload size={64} className="text-spotify-green animate-bounce mb-4" />
                      <p className="text-spotify-green font-black uppercase tracking-widest">DRAG AND DROP STREAM</p>
                    </div>
                  )}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="SONG_NAME | SOURCE_URL"
                    className="w-full h-80 bg-black/40 border border-white/5 rounded-[32px] p-8 text-white font-mono text-sm focus:outline-none focus:border-spotify-green/30 transition-all custom-scrollbar placeholder:text-zinc-800"
                    disabled={isImporting}
                  />
                </div>

                {error && (
                  <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-500 text-xs font-black uppercase tracking-widest">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  onClick={handleImport}
                  disabled={isImporting || !inputText.trim()}
                  className="w-full py-6 bg-white text-black rounded-[24px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                >
                  {isImporting ? <Loader2 className="animate-spin mx-auto" /> : 'INITIATE SYSTEM SYNC'}
                </button>

                <p className="text-center text-[9px] font-black text-zinc-700 uppercase tracking-widest">Format Protocol: [Song Name] | [Direct URL]</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
