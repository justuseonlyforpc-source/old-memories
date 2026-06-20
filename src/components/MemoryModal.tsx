import { motion } from 'motion/react';
import { X, MapPin, Calendar, Heart, ChevronLeft, ChevronRight, Volume2, VolumeX, Folder, Smile, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Memory } from '../types';

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleNotifly?: (id: string) => void;
  triggerToast?: (title: string, desc: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function MemoryModal({
  memory,
  onClose,
  onToggleFavorite,
  onDelete,
  onToggleNotifly,
  triggerToast,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false
}: MemoryModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Cancel any active speech when memory changes
    if (speechSynth) {
      speechSynth.cancel();
      setIsSpeaking(false);
    }
  }, [memory, speechSynth]);

  const toggleSpeech = () => {
    if (!speechSynth) return;

    if (isSpeaking) {
      speechSynth.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `Memory: ${memory.title}. Dated ${memory.date}, in ${memory.location || 'unknown location'}. Backstory: ${memory.backstory}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.05; // soft warmth
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      setSpeechUtterance(utterance);
      setIsSpeaking(true);
      speechSynth.speak(utterance);
    }
  };

  // Helper to color-code emotion badges
  const getEmotionStyles = (emotion: string) => {
    switch (emotion) {
      case 'Happy': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Nostalgic': return 'bg-[#eae3d2] text-[#6d4c41] border-[#dfd4be]';
      case 'Peaceful': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Excited': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Melancholic': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#1e1c19]/75 backdrop-blur-sm" id="memory-modal-overlay">
      {/* Container with intro animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-5xl bg-[#fdfcf7] rounded-2xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
        id="memory-modal-container"
      >
        {/* Navigation - Overlay controls for quick browsing (Desktop side buttons) */}
        {onPrev && hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-all hover:scale-115 active:scale-95 hidden md:flex items-center justify-center"
            title="Previous Memory"
            id="modal-btn-prev-desktop"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {onNext && hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-all hover:scale-115 active:scale-95 hidden md:flex items-center justify-center"
            title="Next Memory"
            id="modal-btn-next-desktop"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* TOP CONTROLS FOR MOBILE & DESKTOP ROW */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Audio narration reader */}
          <button
            onClick={toggleSpeech}
            className={`p-2.5 rounded-full transition-all text-stone-700 shadow-sm border ${
              isSpeaking 
                ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse' 
                : 'bg-white hover:bg-stone-50 border-stone-200'
            }`}
            title={isSpeaking ? "Mute Narration" : "Listen to Backstory"}
            id="modal-btn-audio"
          >
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Notifly Toggle Button */}
          <button
            onClick={() => {
              if (onToggleNotifly) {
                onToggleNotifly(memory.id);
              }
            }}
            className={`p-2.5 rounded-full transition-all border shadow-sm ${
              memory.isNotiflyAlertEnabled 
                ? 'bg-amber-150 border-amber-300 text-amber-900' 
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
            }`}
            title={memory.isNotiflyAlertEnabled ? "Mute Notifly Nostalgia Alerts" : "Enable Notifly Nostalgia Alerts"}
            id="modal-btn-notifly"
          >
            <Bell size={18} className={memory.isNotiflyAlertEnabled ? "animate-pulse" : ""} fill={memory.isNotiflyAlertEnabled ? "currentColor" : "none"} />
          </button>

          {/* Favorite Toggle Button */}
          <button
            onClick={() => onToggleFavorite(memory.id)}
            className={`p-2.5 rounded-full transition-all border shadow-sm ${
              memory.isFavorite 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
            }`}
            title={memory.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            id="modal-btn-fav"
          >
            <Heart size={18} fill={memory.isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all"
            title="Close"
            id="modal-btn-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* LEFT COLUMN: The Polaroid Photo */}
        <div className="w-full md:w-1/2 bg-[#f4eff0] p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-stone-200 overflow-y-auto">
          <div className="w-full max-w-sm bg-white p-4 pb-8 rounded shadow-lg border border-stone-200/60 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="relative aspect-4/3 bg-stone-100 overflow-hidden rounded border border-stone-100">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-amber-50 text-[10px] uppercase font-mono px-2 py-0.5 rounded tracking-widest">
                {memory.year}
              </div>
            </div>

            {/* Handwritten bottom caption of the Polaroid */}
            <div className="mt-4 text-center">
              <p className="font-serif italic text-lg text-amber-950 font-medium tracking-tight">
                {memory.title}
              </p>
              <p className="font-mono text-xs text-stone-400 mt-1 select-all">
                #COLLECTION-{memory.id.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Backstory & Tags (Journal Page) */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-8 overflow-y-auto bg-[#faf8f2]">
          <div>
            {/* Header section with category, emotion & date */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs mt-4 md:mt-2">
              <span className="flex items-center gap-1 text-stone-500 font-mono">
                <Folder size={12} /> {memory.category}
              </span>
              <span className="text-stone-300">•</span>
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono flex items-center gap-1 ${getEmotionStyles(memory.emotion)}`}>
                <Smile size={10} /> {memory.emotion}
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1 text-stone-500 font-mono">
                <Calendar size={12} /> {memory.date}
              </span>
            </div>

            {/* Backstory title */}
            <h2 className="font-serif text-2xl md:text-3xl text-stone-800 font-bold tracking-tight mb-4">
              {memory.title}
            </h2>

            {/* Backstory text resembling a dairy-entry sheet */}
            <div className="relative p-5 bg-[#faf6ea] border border-stone-200/50 rounded-xl shadow-xs">
              {/* Paper lines overlay decoration */}
              <div className="absolute inset-0 pointer-events-none border-t border-b border-stone-200/20 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:100%_2rem]" />
              
              <p className="relative font-serif text-[#3e3a35] text-base leading-7 whitespace-pre-wrap italic">
                “ {memory.backstory} ”
              </p>
            </div>
          </div>

          {/* Footer of card details */}
          <div className="mt-8 pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Geotag */}
            {memory.location && (
              <div className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 transition-colors text-xs font-mono">
                <MapPin size={14} className="text-amber-700" />
                <span>{memory.location}</span>
              </div>
            )}

            {/* Quick delete / remove button */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to bury this memory in archives permanently?')) {
                  onDelete(memory.id);
                }
              }}
              className="text-stone-400 hover:text-rose-600 hover:underline transition-colors text-xs font-mono"
              title="Delete memory"
              id="modal-btn-delete"
            >
              Archive permanently
            </button>
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION row inside modal */}
        <div className="flex md:hidden items-center justify-between border-t border-stone-200 p-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
          <button
            disabled={!hasPrev}
            onClick={onPrev}
            className={`flex items-center gap-1 px-4 py-2 rounded text-stone-700 text-xs font-mono ${
              !hasPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-100 active:bg-stone-200'
            }`}
            id="modal-btn-prev-mobile"
          >
            <ChevronLeft size={16} /> Older
          </button>
          <span className="text-stone-400 text-xs font-mono">Scrapbook Swipe</span>
          <button
            disabled={!hasNext}
            onClick={onNext}
            className={`flex items-center gap-1 px-4 py-2 rounded text-stone-700 text-xs font-mono ${
              !hasNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-100 active:bg-stone-200'
            }`}
            id="modal-btn-next-mobile"
          >
            Newer <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
