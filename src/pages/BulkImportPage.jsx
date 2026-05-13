import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, FileAudio, Loader2, CheckCircle, 
  AlertCircle, Play, Trash2, 
  RefreshCw, Music, Check
} from 'lucide-react';
import { songService } from '../services/songService';
import { cleanSongName } from '../lib/utils';

const BulkImportPage = ({ onRefresh, existingSongs = [] }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  const existingSongNames = useMemo(() => {
    return new Set((Array.isArray(existingSongs) ? existingSongs : []).map(s => s.song_name?.toLowerCase()));
  }, [existingSongs]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback((files) => {
    const supportedTypes = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
    const newFiles = Array.from(files).filter(file => {
      const ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
      return supportedTypes.includes(`.${ext.toLowerCase()}`);
    });

    setUploadQueue(prev => {
      const currentQueueNames = new Set(prev.map(f => f.name.toLowerCase()));
      const addedFiles = [];

      for (const file of newFiles) {
        const rawName = file.name.replace(/\.[^/.]+$/, "");
        const name = cleanSongName(rawName);
        const lowerName = name.toLowerCase();

        if (currentQueueNames.has(lowerName)) continue;
        currentQueueNames.add(lowerName);

        const isDuplicate = existingSongNames.has(lowerName);

        addedFiles.push({
          file,
          id: Math.random().toString(36).substring(7),
          name: name,
          size: file.size,
          progress: isDuplicate ? 100 : 0,
          status: isDuplicate ? 'exists' : 'pending',
          error: null
        });
      }

      return [...prev, ...addedFiles];
    });
  }, [existingSongNames]);

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
    handleFiles(e.dataTransfer.files);
  };

  const onPaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const files = [];
    for (const item of items) {
      if (item.kind === 'file') {
        files.push(item.getAsFile());
      }
    }
    if (files.length > 0) handleFiles(files);
  };

  const removeFile = (id) => {
    setUploadQueue(prev => prev.filter(f => f.id !== id));
  };

  const startUpload = async () => {
    if (isUploading || uploadQueue.length === 0) return;
    setIsUploading(true);
    
    const pendingFiles = uploadQueue.filter(f => f.status === 'pending');
    let completedCount = 0;

    for (const item of pendingFiles) {
      try {
        setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading', error: null } : f));
        
        await songService.uploadSongFile(item.file, item.name, (progress) => {
          setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, progress } : f));
        });

        setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploaded', progress: 100 } : f));
      } catch (err) {
        setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'failed', error: err.message } : f));
      } finally {
        completedCount++;
        const totalToProcess = pendingFiles.length;
        setOverallProgress(Math.round((completedCount / totalToProcess) * 100));
      }
    }

    setIsUploading(false);
    if (onRefresh) onRefresh();
  };

  const retryFailed = () => {
    setUploadQueue(prev => prev.map(f => f.status === 'failed' ? { ...f, status: 'pending', progress: 0 } : f));
    startUpload();
  };

  const clearQueue = () => {
    if (isUploading) return;
    setUploadQueue([]);
    setOverallProgress(0);
  };

  const stats = useMemo(() => ({
    total: uploadQueue.length,
    uploaded: uploadQueue.filter(f => f.status === 'uploaded').length,
    failed: uploadQueue.filter(f => f.status === 'failed').length,
    exists: uploadQueue.filter(f => f.status === 'exists').length,
    uploading: uploadQueue.filter(f => f.status === 'uploading').length,
    pending: uploadQueue.filter(f => f.status === 'pending').length
  }), [uploadQueue]);

  return (
    <div className="pt-4 lg:pt-8 pb-32 w-full max-w-5xl mx-auto px-4 lg:px-8 overflow-hidden" onPaste={onPaste}>
      <header className="mb-12">
        <div className="flex items-center space-x-4 mb-2">
           <div className="h-12 w-12 bg-spotify-green rounded-2xl flex items-center justify-center shadow-lg shadow-spotify-green/20">
              <Upload size={24} className="text-black" />
           </div>
           <div>
             <h1 className="text-4xl font-bold text-white tracking-tight">Bulk Import</h1>
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Import music modules to your library</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Upload Zone & Queue */}
        <div className="lg:col-span-2 space-y-10">
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative h-72 rounded-[40px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${
              isDragging 
                ? 'border-spotify-green bg-spotify-green/10 shadow-2xl' 
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFiles(e.target.files)} 
              multiple 
              accept=".mp3,.wav,.m4a,.ogg,.flac" 
              className="hidden" 
            />
            
            <motion.div 
              animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-6 transition-all ${
                isDragging ? 'bg-spotify-green text-black' : 'bg-white/5 text-zinc-600 group-hover:text-white'
              }`}
            >
              <Upload size={32} />
            </motion.div>

            <div className="text-center relative z-10 px-8">
              <h3 className="text-xl font-bold text-white mb-2">Drop your files here</h3>
              <p className="text-zinc-500 text-sm font-medium">Or click to browse from your device</p>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-4">Supported: MP3, WAV, FLAC, M4A, OGG</p>
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Import Queue</h4>
                {stats.total > 0 && !isUploading && (
                  <button onClick={clearQueue} className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Clear All</button>
                )}
             </div>

             <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {uploadQueue.length === 0 ? (
                  <div className="h-40 glass-panel rounded-[32px] flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
                     <Music size={32} className="text-zinc-700 mb-4" />
                     <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No tracks in queue</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {uploadQueue.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center group hover:bg-white/10 transition-all"
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 mr-4 ${
                          item.status === 'uploaded' ? 'bg-spotify-green/20 text-spotify-green' : 
                          item.status === 'exists' ? 'bg-white/5 text-zinc-600' :
                          item.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-zinc-600'
                        }`}>
                          {item.status === 'uploading' ? (
                            <Loader2 size={24} className="animate-spin text-spotify-green" />
                          ) : item.status === 'uploaded' ? (
                            <CheckCircle size={24} />
                          ) : item.status === 'exists' ? (
                            <Check size={24} className="opacity-40" />
                          ) : item.status === 'failed' ? (
                            <AlertCircle size={24} />
                          ) : (
                            <FileAudio size={24} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 mr-4">
                           <div className="flex items-center justify-between mb-2">
                              <h5 className={`text-sm font-bold truncate ${item.status === 'exists' ? 'text-zinc-500' : 'text-white'}`}>{item.name}</h5>
                              {item.status === 'exists' ? (
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Existing</span>
                              ) : (
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{formatFileSize(item.size)}</span>
                              )}
                           </div>
                           <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${item.status === 'failed' ? 'bg-red-500' : 'bg-spotify-green'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                           </div>
                        </div>

                        {!isUploading && (
                          <button 
                            onClick={() => removeFile(item.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Dashboard */}
        <div className="space-y-8">
           <div className="glass-panel p-8 space-y-8 sticky top-28 shadow-2xl">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-4">Import Status</h4>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total</span>
                    <span className="text-2xl font-black text-white">{stats.total}</span>
                 </div>
                 <div className="bg-spotify-green/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-spotify-green/10">
                    <span className="text-[10px] font-bold text-spotify-green uppercase tracking-widest mb-1">Imported</span>
                    <span className="text-2xl font-black text-spotify-green">{stats.uploaded}</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Skipped</span>
                    <span className="text-2xl font-black text-zinc-400">{stats.exists}</span>
                 </div>
                 <div className={`p-4 rounded-2xl flex flex-col items-center justify-center border transition-colors ${stats.failed > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${stats.failed > 0 ? 'text-red-500' : 'text-zinc-500'}`}>Failed</span>
                    <span className={`text-2xl font-black ${stats.failed > 0 ? 'text-red-500' : 'text-white'}`}>{stats.failed}</span>
                 </div>
              </div>

              {isUploading && (
                <div className="space-y-3 py-2">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Overall Progress</span>
                      <span className="text-[10px] font-bold text-spotify-green">{overallProgress}%</span>
                   </div>
                   <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-spotify-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                      />
                   </div>
                </div>
              )}

              <div className="space-y-3">
                 <button 
                   onClick={startUpload}
                   disabled={isUploading || stats.pending === 0}
                   className="btn-spotify w-full py-4 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale font-bold text-sm"
                 >
                   {isUploading ? (
                     <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Importing...</span>
                     </>
                   ) : (
                     <>
                        <Play size={20} fill="currentColor" />
                        <span>Start Import</span>
                     </>
                   )}
                 </button>

                 {stats.failed > 0 && !isUploading && (
                   <button 
                     onClick={retryFailed}
                     className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center space-x-3 text-sm"
                   >
                     <RefreshCw size={18} />
                     <span>Retry Failed</span>
                   </button>
                 )}
              </div>
           </div>

           <div className="glass-panel p-6 border-spotify-green/20">
              <div className="flex items-center space-x-2 mb-4 text-spotify-green">
                 <AlertCircle size={18} />
                 <h4 className="text-[10px] font-bold uppercase tracking-widest">Library Guard</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Our duplicate detection engine is active. Tracks already in your library will be skipped automatically to keep your library clean.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportPage;
