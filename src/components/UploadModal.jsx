import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { songService } from '../services/songService';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, existingSongs = [] }) => {
  const [inputText, setInputText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  
  const fileInputRef = useRef(null);

  const handleImport = async () => {
    if (!inputText.trim()) {
      setError('Please enter at least one track or drop a .txt file.');
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
        // Handle potential different delimiters if needed, but stick to |
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 2) continue;

        const [song_name, url] = parts;
        if (!song_name || !url) continue;

        if (duplicateUrls.has(url)) continue;

        songsToImport.push({ song_name, url });
        duplicateUrls.add(url);
      }

      if (songsToImport.length === 0) {
        setError('No new or valid tracks found to import.');
        setIsImporting(false);
        return;
      }

      await songService.bulkImport(songsToImport);
      
      setSuccessCount(songsToImport.length);
      if (onUploadSuccess) onUploadSuccess();

      setTimeout(() => {
        setInputText('');
        setSuccessCount(0);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Import Error:', err);
      setError(err.message || 'Failed to import tracks. Check your format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(prev => prev + (prev ? '\n' : '') + event.target.result);
      };
      reader.readAsText(file);
    } else {
      setError('Only .txt files are supported for drag-and-drop.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={isImporting ? null : onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="max-w-2xl w-full bg-[#161616] rounded-[40px] border border-white/5 p-8 relative z-10 shadow-2xl overflow-hidden"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-neon-gradient flex items-center justify-center">
                  <ListMusic size={22} className="text-black" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white">Bulk Import</h2>
                   <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Paste text or drop .txt file</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {successCount > 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 bg-[#7CFF6B]/10 rounded-full flex items-center justify-center mb-8 border border-[#7CFF6B]/20">
                  <CheckCircle size={40} className="text-[#7CFF6B]" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-white">Import Successful</h2>
                <p className="text-zinc-500 font-medium text-xs tracking-wide">{successCount} tracks successfully integrated into your vault.</p>
              </div>
            ) : (
              <div className="relative">
                {isDragging && (
                  <div className="absolute inset-0 z-50 bg-[#7CFF6B]/10 border-4 border-dashed border-[#7CFF6B]/40 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm transition-all">
                    <Upload size={48} className="text-[#7CFF6B] mb-4" />
                    <p className="text-[#7CFF6B] font-black uppercase tracking-widest">Drop .txt file to import</p>
                  </div>
                )}

                <div className="mb-6 px-2 flex justify-between items-end">
                  <p className="text-zinc-400 text-[11px] font-medium leading-relaxed">
                    Format: <code className="text-[#7CFF6B] bg-black/40 px-2 py-0.5 rounded font-mono">song_name | url</code>
                  </p>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase">Supported: Copy-Paste, .txt Drop</p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-2xl flex items-center space-x-3">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={"My Favorite Song | https://example.com/audio.mp3\nAnother Track | https://example.com/audio2.wav"}
                    className="w-full h-72 bg-black/20 border border-white/5 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-[#7CFF6B]/40 focus:bg-black/30 transition-all font-mono custom-scrollbar placeholder:text-zinc-800"
                    disabled={isImporting}
                  />

                  <button
                    onClick={handleImport}
                    disabled={isImporting || !inputText.trim()}
                    className="w-full py-4 bg-[#7CFF6B] hover:bg-[#54ff84] text-black rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl disabled:opacity-50"
                  >
                    {isImporting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing {inputText.split('\n').length} Entries...</span>
                      </div>
                    ) : (
                      <span>Initiate Bulk Import</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
