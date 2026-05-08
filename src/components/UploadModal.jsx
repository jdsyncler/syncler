import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Loader2, CheckCircle, Upload as UploadIcon, AlertCircle, FileAudio } from 'lucide-react';
import { songService } from '../services/songService';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [songName, setSongName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
      if (!songName) setSongName(selectedFile.name.replace('.mp3', ''));
      setError(null);
    } else {
      setError('Please select a valid MP3 file.');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'audio/mpeg') {
      setFile(droppedFile);
      if (!songName) setSongName(droppedFile.name.replace('.mp3', ''));
      setError(null);
    } else {
      setError('Please drop a valid MP3 file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await songService.uploadSongFile(file, songName);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onUploadSuccess();
        setFile(null);
        setSongName('');
      }, 2000);
    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.message || 'Failed to upload song. Check your Supabase storage policies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="max-w-md w-full glass rounded-[40px] border border-white/10 p-10 relative z-10 shadow-2xl overflow-hidden"
          >
            {success ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 border border-primary/30"
                >
                  <CheckCircle size={56} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-black mb-3 text-white tracking-tighter uppercase">Track Synced</h2>
                <p className="text-zinc-500 font-medium tracking-wide">Updating your private library...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center space-x-3 text-primary">
                    <UploadIcon size={24} />
                    <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Add Track</h2>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl flex items-start space-x-3">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Select MP3 File</label>
                    <div 
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : file 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".mp3"
                        className="hidden"
                      />
                      {file ? (
                        <>
                          <FileAudio className="text-primary" size={32} />
                          <span className="text-white font-bold text-sm truncate max-w-[200px]">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadIcon className="text-zinc-500" size={32} />
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Drag & Drop or Click</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Song Name</label>
                    <div className="relative group">
                      <Music className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        required
                        type="text"
                        value={songName}
                        onChange={(e) => setSongName(e.target.value)}
                        placeholder="Song Name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium placeholder:text-zinc-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full bg-primary hover:bg-green-400 text-black font-black py-5 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 uppercase tracking-widest text-sm"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <span>Sync Track</span>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
