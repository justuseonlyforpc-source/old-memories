import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Download, 
  Upload as UploadIcon, 
  BookOpen, 
  Calendar, 
  Smile, 
  Compass, 
  Grid,
  Heart,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Bell,
  BellRing,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  X
} from 'lucide-react';

import { Memory, MemoryCategory, MemoryEmotion } from './types';
import { DEFAULT_MEMORIES } from './data/defaultMemories';

import CategoriesSection from './components/CategoriesSection';
import TimelineSection from './components/TimelineSection';
import MemoryModal from './components/MemoryModal';
import UploadMemoryModal from './components/UploadMemoryModal';
import StatsOverview from './components/StatsOverview';

export default function App() {
  // State setup
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Notifly Toast & Notification State
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>>([]);
  const [isNotiflyOpen, setIsNotiflyOpen] = useState(false);
  const [isNotiflyAudioEnabled, setIsNotiflyAudioEnabled] = useState(true);
  const [notifs, setNotifs] = useState<Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    isFresh: boolean;
    category?: string;
  }>>([
    {
      id: 'notif-1',
      title: 'DostLog Configured',
      description: 'Connected perfectly with browser local storage and Notifly services.',
      timestamp: 'A moment ago',
      isFresh: true,
      category: 'System'
    },
    {
      id: 'notif-2',
      title: '🎉 Memory Anniversary Today',
      description: 'Your beautiful "College Days" scrapbooking memory turned exactly 3 years old today!',
      timestamp: '2 hours ago',
      isFresh: true,
      category: 'Memory'
    },
    {
      id: 'notif-3',
      title: '🔔 Notifly Engine Live',
      description: 'Anniversary push rules are fully active for all favorited memory postcard stacks.',
      timestamp: 'Yesterday',
      isFresh: false,
      category: 'Schedules'
    }
  ]);

  // Audio indicator synthesizer using browser Web Audio API (100% offline-proof)
  const playNotiflyChime = () => {
    if (!isNotiflyAudioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5 or close-fourth

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {
      // Ignored if browser policy restrains audio interaction before users click
    }
  };

  // Toast trigger
  const triggerToast = (
    title: string,
    description: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    playNotiflyChime();

    // Auto delete in 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Toggle single memory Notification rule
  const handleToggleNotifly = (id: string) => {
    const updated = memories.map((m) => {
      if (m.id === id) {
        const nextState = !m.isNotiflyAlertEnabled;
        if (nextState) {
          triggerToast(
            '🔔 Notifly Alert Set',
            `You will be automatically notified on future anniversaries of "${m.title}".`,
            'success'
          );
          // Append live notification
          const freshNotif = {
            id: `notif-${Date.now()}`,
            title: `Anniversary Active: "${m.title}"`,
            description: `A responsive anniversary prompt is scheduled for ${m.date}.`,
            timestamp: 'Just now',
            isFresh: true,
            category: 'Schedules'
          };
          setNotifs((prev) => [freshNotif, ...prev]);
        } else {
          triggerToast(
            '🔕 Alert Suspended',
            `Silenced scheduler reminders for "${m.title}".`,
            'info'
          );
        }
        return { ...m, isNotiflyAlertEnabled: nextState };
      }
      return m;
    });
    saveMemories(updated);

    // update modal active frame too
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory((prev) => prev ? { ...prev, isNotiflyAlertEnabled: !prev.isNotiflyAlertEnabled } : null);
    }
  };

  // Search and filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'All' | 'Favorites'>('All');
  const [selectedEmotion, setSelectedEmotion] = useState<MemoryEmotion | 'All'>('All');
  const [yearFilter, setYearFilter] = useState<number | 'All'>('All');

  // Carousel in Hero Section
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Load and hydrate from Local Storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scrapbook_memories_v1');
      if (stored) {
        setMemories(JSON.parse(stored));
      } else {
        // Fallback to our stunning generated preloaded defaults
        setMemories(DEFAULT_MEMORIES);
        localStorage.setItem('scrapbook_memories_v1', JSON.stringify(DEFAULT_MEMORIES));
      }
    } catch (e) {
      console.error('Local Storage failed, fallback', e);
      setMemories(DEFAULT_MEMORIES);
    }
  }, []);

  // Save to Local Storage every time list modifies
  const saveMemories = (updatedList: Memory[]) => {
    setMemories(updatedList);
    try {
      localStorage.setItem('scrapbook_memories_v1', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to write into Local Storage', e);
    }
  };

  // Hero carousel automatic rotation
  useEffect(() => {
    if (memories.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % memories.length);
    }, 6000); // 6s rotation
    return () => clearInterval(interval);
  }, [memories]);

  // Compute filters
  useEffect(() => {
    let result = [...memories];

    // Search bar string matching (matches title, short description, backstory, geotag)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.backstory.toLowerCase().includes(query) ||
          m.location.toLowerCase().includes(query)
      );
    }

    // Category folder filtering
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Favorites') {
        result = result.filter((m) => m.isFavorite);
      } else {
        result = result.filter((m) => m.category === selectedCategory);
      }
    }

    // Emotion query filter
    if (selectedEmotion !== 'All') {
      result = result.filter((m) => m.emotion === selectedEmotion);
    }

    // Year range filter
    if (yearFilter !== 'All') {
      result = result.filter((m) => m.year === yearFilter);
    }

    setFilteredMemories(result);
  }, [memories, searchQuery, selectedCategory, selectedEmotion, yearFilter]);

  // Handle addition of a memory (supports single memory or multiple memories)
  const handleAddMemory = (newMemoryData: Omit<Memory, 'id'> | Omit<Memory, 'id'>[]) => {
    const items = Array.isArray(newMemoryData) ? newMemoryData : [newMemoryData];
    const freshMemories: Memory[] = items.map((item, idx) => ({
      ...item,
      id: `mem-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000000)}`
    }));
    const updated = [...freshMemories, ...memories];
    saveMemories(updated);
  };

  // Handle deletion
  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    saveMemories(updated);
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = memories.map((m) => {
      if (m.id === id) {
        return { ...m, isFavorite: !m.isFavorite };
      }
      return m;
    });
    saveMemories(updated);
    
    // update modal active frame too
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  // Navigation handlers within detail modal
  const activeDetailIndex = filteredMemories.findIndex((m) => m.id === selectedMemory?.id);
  const hasPrevDetail = activeDetailIndex > 0;
  const hasNextDetail = activeDetailIndex < filteredMemories.length - 1;

  const handlePrevDetail = () => {
    if (hasPrevDetail) {
      setSelectedMemory(filteredMemories[activeDetailIndex - 1]);
    }
  };

  const handleNextDetail = () => {
    if (hasNextDetail) {
      setSelectedMemory(filteredMemories[activeDetailIndex + 1]);
    }
  };

  // Compute folder counts
  const folderCounts = {
    All: memories.length,
    Favorites: memories.filter((m) => m.isFavorite).length,
    Family: memories.filter((m) => m.category === 'Family').length,
    Friends: memories.filter((m) => m.category === 'Friends').length,
    Trips: memories.filter((m) => m.category === 'Trips').length,
    'School/College Days': memories.filter((m) => m.category === 'School/College Days').length
  };

  // Extract all distinct years available for dropdown
  const availableYears = Array.from(new Set(memories.map((m) => m.year))).sort((a: number, b: number) => b - a);

  // Backup / Export Scrapbook as JSON
  const handleExportScrapbook = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `My_Memory_Scrapbook_Backup_${new Date().getFullYear()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore / Import Scrapbook from local JSON
  const handleImportScrapbook = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // simple validation of schema properties
          const valid = parsed.every((item) => item.id && item.title && item.imageUrl);
          if (valid) {
            saveMemories(parsed);
            alert(`Wonderous! Imported ${parsed.length} memories back into your digital scrapbooking desk.`);
          } else {
            alert('Oh dear! This JSON backup file is not matching the scrapbook formats.');
          }
        }
      } catch (err) {
        alert('Could not parsed JSON format. Make sure you import a backup file exported from this page!');
      }
    };
    fileReader.readAsText(file);
  };

  // Quick reset all filter parameters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedEmotion('All');
    setYearFilter('All');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-stone-900 selection:bg-amber-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. APP TOP BAR HEADER */}
      <header className="border-b border-stone-200 bg-[#FDFCF7]/95 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 sm:px-8 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2.5">
          {/* Logo illustration */}
          <div className="p-2.5 bg-amber-900 text-amber-50 rounded-xl shadow-inner flex items-center justify-center">
            <Compass size={18} className="animate-spin-slow text-amber-100" />
          </div>
          <div>
            <h1 className="font-serif italic font-bold text-lg md:text-xl text-stone-850 tracking-tight flex items-center gap-1.5">
              DostLog, Purani Yade
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-amber-50 font-normal text-amber-900 border border-amber-100 select-all">
                Private Scrapbook
              </span>
            </h1>
            <p className="text-[10px] font-mono text-stone-400 tracking-wider">
              A CHRONOLOGICAL SAFE FOR TIMELESS MOMENTS
            </p>
          </div>
        </div>

        {/* Action icons / Backups */}
        <div className="flex items-center gap-2">
          {/* Export JSON Button */}
          <button
            onClick={handleExportScrapbook}
            className="p-2 hover:bg-stone-150 rounded-xl text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1.5 text-xs font-mono border border-transparent hover:border-stone-200"
            title="Export Scrapbook Backup to Machine"
            id="nav-btn-export"
          >
            <Download size={14} />
            <span className="hidden md:inline">Save Backup</span>
          </button>

          {/* Import JSON Button */}
          <label
            className="p-2 hover:bg-stone-150 rounded-xl text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1.5 text-xs font-mono border border-transparent hover:border-stone-200 cursor-pointer"
            title="Import Scrapbook from JSON File"
            id="nav-lbl-import"
          >
            <UploadIcon size={14} />
            <span className="hidden md:inline">Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportScrapbook}
              className="hidden"
            />
          </label>

          {/* Notifly Notification Hub Bell icon */}
          <div className="relative ml-1" id="notifly-icon-container">
            <button
              onClick={() => setIsNotiflyOpen(!isNotiflyOpen)}
              className={`p-2 rounded-xl transition-all relative flex items-center justify-center border ${
                isNotiflyOpen 
                  ? 'bg-amber-50 border-amber-300 text-amber-950' 
                  : 'hover:bg-stone-150 border-stone-200 text-stone-500 hover:text-stone-800'
              }`}
              title="Notifly Notifications Area"
              id="nav-btn-notifly-bell"
            >
              <Bell size={14} className={notifs.some(n => n.isFresh) ? "animate-pulse" : ""} />
              {notifs.some(n => n.isFresh) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-900 text-white rounded-full flex items-center justify-center text-[9px] font-mono font-bold animate-pulse">
                  {notifs.filter(n => n.isFresh).length}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {isNotiflyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2.5 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 text-left font-sans"
                  id="notifly-dropdown-panel"
                >
                  {/* Header */}
                  <div className="bg-stone-50/50 border-b border-stone-150 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BellRing size={14} className="text-amber-800 animate-pulse" />
                      <span className="text-xs uppercase font-mono font-bold tracking-wider text-stone-700">Notifly Stream</span>
                    </div>
                    {/* Sound control inside notification panel */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextState = !isNotiflyAudioEnabled;
                          setIsNotiflyAudioEnabled(nextState);
                          // Delay slightly so nextState is set
                          setTimeout(() => {
                            triggerToast(
                              !nextState ? '🔇 Sound Off' : '🔊 Sound On',
                              !nextState ? 'Audio chimes are now silenced.' : 'Audio chimes are now active.',
                              'info'
                            );
                          }, 50);
                        }}
                        className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors"
                        title={isNotiflyAudioEnabled ? "Disable Sounds" : "Enable Sounds"}
                      >
                        {isNotiflyAudioEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
                      </button>
                      <button
                        onClick={() => {
                          setNotifs((prev) => prev.map((n) => ({ ...n, isFresh: false })));
                          triggerToast('All Cleared', 'Marked all notification logs as acknowledged.', 'info');
                        }}
                        className="text-[10px] uppercase font-mono hover:underline text-amber-900 font-bold"
                      >
                        Read All
                      </button>
                    </div>
                  </div>

                  {/* Notification items list */}
                  <div className="max-h-[290px] overflow-y-auto divide-y divide-stone-100">
                    {notifs.length > 0 ? (
                      notifs.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, isFresh: false } : n));
                          }}
                          className={`p-3.5 hover:bg-[#FDFCF7]/50 cursor-pointer transition-colors relative flex items-start gap-2.5 ${
                            notif.isFresh ? 'bg-amber-50/25' : ''
                          }`}
                        >
                          {notif.isFresh && (
                            <div className="absolute right-3.5 top-3.5 w-1.5 h-1.5 bg-amber-950 rounded-full animate-ping" />
                          )}
                          <div className={`mt-0.5 p-1.5 rounded-lg flex items-center justify-center text-xs ${
                            notif.category === 'Memory' 
                              ? 'bg-rose-50 text-rose-700' 
                              : notif.category === 'Schedules' 
                                ? 'bg-amber-100 text-amber-900' 
                                : 'bg-stone-100 text-stone-600'
                          }`}>
                            {notif.category === 'Memory' ? <Heart size={11} /> : notif.category === 'Schedules' ? <Bell size={11} /> : <Settings size={11} />}
                          </div>
                          <div>
                            <p className="text-xs font-serif font-bold text-stone-800 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-stone-500 leading-normal mt-0.5">
                              {notif.description}
                            </p>
                            <span className="text-[9px] font-mono text-stone-400 mt-1 block">
                              {notif.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-stone-400 font-mono text-[11px] flex flex-col items-center justify-center gap-1.5">
                        <BellRing size={18} className="text-stone-300" />
                        No active memory alerts.
                      </div>
                    )}
                  </div>

                  {/* Actions / Simulators */}
                  <div className="bg-stone-50/50 border-t border-stone-150 p-2.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (memories.length === 0) {
                          triggerToast('Empty Scrapbook', 'Please write a scrapbook entry or add images before testing.', 'warning');
                          return;
                        }
                        const randomIndex = Math.floor(Math.random() * memories.length);
                        const rand = memories[randomIndex];
                        
                        // Fire a simulated alert anniversary
                        triggerToast(
                          '🎉 Golden Anniversary',
                          `On this day in ${rand.year}: "${rand.title}" anniversary!`,
                          'success'
                        );

                        // Also append a fresh notif
                        const activeSimNotif = {
                          id: `sim-${Date.now()}`,
                          title: `Anniversary alert: ${rand.title}`,
                          description: `Reminding you of ${rand.location || 'cozy memories'} in ${rand.year}. "${rand.description}"`,
                          timestamp: 'Just now',
                          isFresh: true,
                          category: 'Memory'
                        };
                        setNotifs((prev) => [activeSimNotif, ...prev]);
                      }}
                      className="w-full text-center py-2 bg-amber-900 border border-amber-950 hover:bg-amber-850 text-stone-50 rounded-lg text-[10px] font-mono tracking-wide transition-all shadow-5xs"
                    >
                      💡 Preview Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifs([]);
                        triggerToast('Panel Cleared', 'Cleared the Notifly history panel.', 'info');
                      }}
                      className="w-full text-center py-2 bg-white border border-stone-200 hover:border-stone-300 text-stone-600 rounded-lg text-[10px] font-mono tracking-wide transition-all"
                    >
                      🗑️ Reset Logs
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="ml-2 bg-amber-900 text-stone-50 hover:bg-amber-850 px-4 py-2.5 rounded-xl font-mono text-xs font-medium flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
            id="nav-btn-upload"
          >
            <Plus size={14} /> Write Entry
          </button>
        </div>
      </header>

      {/* 2. MAJESTIC HERO SECTION WITH PHOTOS CAROUSEL BACKGROUND */}
      <section className="bg-gradient-to-b from-[#f2efe4]/75 to-[#FDFCF7] py-14 px-4 border-b border-stone-200/50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto w-full">
        
        {/* Absolute design decorations */}
        <div className="absolute left-[-100px] top-[-100px] w-96 h-96 rounded-full bg-amber-200/10 blur-3xl pointer-events-none select-none" />
        <div className="absolute right-[-100px] bottom-[-100px] w-96 h-96 rounded-full bg-rose-200/10 blur-3xl pointer-events-none select-none" />

        {/* LEFT COLUMN: Deep prose & triggers */}
        <div className="w-full md:w-1/2 space-y-6 text-left max-w-xl relative z-15">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-250 text-[10px] font-mono uppercase tracking-widest font-bold">
            <Sparkles size={11} className="text-amber-800" /> Preserving Memories, Cherishing Moments
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-5xl font-black text-stone-850 tracking-tight leading-tight select-text">
            Preserving Moments, <span className="italic text-amber-950 font-normal">Cherishing Memories</span>.
          </h2>

          <p className="font-serif text-stone-600 text-base leading-relaxed italic select-text">
            “Your private shelf of cozy bonfire songs, sandy coastline roadtrips, campus late-nights, and sunny picnics. Frame your visual postcards, log hand-chalked backstories, and search your epochs down memory lane.”
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-3 bg-amber-900 border border-amber-950 hover:bg-amber-800 text-stone-50 rounded-xl font-mono text-xs font-bold transition-all shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0 cursor-pointer"
              id="hero-btn-upload"
            >
              Frame static polaroid
            </button>
            <a
              href="#timeline-section-root"
              className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 hover:border-stone-300"
            >
              <BookOpen size={14} /> Walk down lane
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: The Vintage Polaroid Carousel Stack */}
        <div className="w-full md:w-1/2 flex justify-center items-center relative min-h-[300px]">
          {memories.length > 0 ? (
            <div className="relative w-72 h-80" id="hero-carousel-stack">
              {memories.map((memory, index) => {
                // Circular indexing styling to stack like actual polaroid pile
                const offset = (index - carouselIndex + memories.length) % memories.length;
                const isCurrent = offset === 0;

                // Stack positions styling
                if (offset > 2) return null; // limit stack view depth to 3 items

                return (
                  <motion.div
                    key={memory.id}
                    onClick={() => setSelectedMemory(memory)}
                    className="absolute inset-0 bg-white p-3 pb-8 rounded shadow-xl border border-stone-200/90 cursor-pointer transform origin-bottom hover:scale-105 transition-transform"
                    style={{
                      zIndex: 30 - offset,
                    }}
                    animate={{
                      scale: isCurrent ? 1 : 1 - offset * 0.05,
                      y: offset * -12,
                      rotate: isCurrent ? -1 : offset * 4 - 3,
                      opacity: isCurrent ? 1 : 0.8 - offset * 0.25,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    id={`hero-carousel-card-${memory.id}`}
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-stone-100 rounded border border-stone-100">
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/60 text-[9px] text-[#faf6ee] font-mono uppercase tracking-widest rounded">
                        {memory.year}
                      </div>

                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 p-1 bg-white/70 backdrop-blur-xs rounded-full shadow text-[#1A1917] hover:scale-110 active:scale-95 flex items-center justify-center">
                          <Eye size={10} />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3.5 text-center px-1">
                      <p className="font-serif italic font-bold text-xs text-stone-850 truncate text-[#2c1d11]">
                        {memory.title}
                      </p>
                      <p className="text-[9px] font-mono text-stone-400 mt-0.5 truncate tracking-wide">
                        {memory.category} • {memory.location}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Carousel Next/Prev triggers (underneath stack) */}
              <div className="absolute bottom-[-50px] left-0 right-0 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + memories.length) % memories.length)}
                  className="p-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 shadow-xs transition-transform"
                  title="Previous Polaroid"
                  id="hero-carousel-prev"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-mono text-[10px] text-stone-400 tracking-widest">
                  STACK PREVIEW ({carouselIndex + 1}/{memories.length})
                </span>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % memories.length)}
                  className="p-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 shadow-xs transition-transform"
                  title="Next Polaroid"
                  id="hero-carousel-next"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-stone-400 py-12">
              <Compass className="mx-auto text-stone-300 animate-spin-slow mb-3" size={36} />
              <p className="font-serif italic">Your private scrapbook shelf is empty.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. DYNAMIC DESK STATS CABINET */}
      <StatsOverview memories={memories} onSelectMemory={setSelectedMemory} />

      {/* 4. SEARCH, DECK CONTROLS & FILTERING BAR */}
      <section className="bg-[#FAF8F2] border-t border-b border-stone-200/60 py-8 px-4" id="search-bar-anchor">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* SEARCH BOX */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-stone-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search old photos, backstories, geotags, emotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FCFAF2] border border-stone-300/80 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-800 transition-all text-stone-800 placeholder-stone-400 font-sans"
              id="search-input-field"
            />
          </div>

          {/* CHRONOLOGICAL DRILLDOWNS (Year slider Dropdown & Emotions) */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Year selector filter */}
            <div className="flex items-center gap-1.5 bg-[#FCFAF2] border border-stone-300/80 rounded-xl px-2 py-1.5 shadow-5xs">
              <Calendar size={13} className="text-amber-850" />
              <select
                value={yearFilter.toString()}
                onChange={(e) => setYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="bg-transparent text-xs text-stone-700 font-mono focus:outline-none cursor-pointer"
                id="filter-select-year"
              >
                <option value="All">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Emotion filter */}
            <div className="flex items-center gap-1.5 bg-[#FCFAF2] border border-stone-300/80 rounded-xl px-2 py-1.5 shadow-5xs">
              <Smile size={13} className="text-amber-850" />
              <select
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value as MemoryEmotion | 'All')}
                className="bg-transparent text-xs text-stone-700 font-mono focus:outline-none cursor-pointer"
                id="filter-select-emotion"
              >
                <option value="All">All Emotions</option>
                <option value="Happy">Happy 😊</option>
                <option value="Nostalgic">Nostalgic 🕯️</option>
                <option value="Peaceful">Peaceful 🌿</option>
                <option value="Excited">Excited ✨</option>
                <option value="Melancholic">Melancholic 🍂</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {(searchQuery.trim() || selectedCategory !== 'All' || selectedEmotion !== 'All' || yearFilter !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3.5 py-2 font-mono text-[10px] uppercase font-bold text-amber-900 border border-dashed border-amber-300 hover:border-amber-700 bg-amber-50 rounded-xl transition-all"
                title="Reset Filters"
                id="btn-reset-filters"
              >
                <RefreshCw size={11} className="inline animate-spin-slow" /> Clear Filter
              </button>
            )}
          </div>

        </div>
      </section>

      {/* NOTIFLY SMART SETTINGS & DELIVERY SCHEDULER BENTO BAR */}
      <section className="bg-[#FDFCF7] pt-8 pb-4 px-4 max-w-5xl mx-auto w-full">
        <div className="bg-[#FAF8F4] border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
          {/* Subtle logo bg banner */}
          <div className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] text-[#3c2918] pointer-events-none">
            <Bell size={240} strokeWidth={1} />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Synced with Notifly Engine
                </span>
              </div>
              <h3 className="font-serif italic text-lg md:text-xl font-bold text-stone-850">
                Nostalgia Scheduler Desk
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-lg">
                Activate dynamic, safety-first anniversary logs. Each favorited or bell-tagged memory is assigned a local epoch interval, bringing back warm, friendly nostalgia exactly when it matters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Option 1: Schedule Interval */}
              <div className="bg-[#FCFAF2] border border-stone-300/60 rounded-xl p-3 flex flex-col gap-1 min-w-[140px] shadow-5xs text-left">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider">Digest Cadence</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-serif font-bold text-stone-700">Weekly Summary</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-900" />
                </div>
              </div>

              {/* Option 2: Active Alarms Count */}
              <div className="bg-[#FCFAF2] border border-stone-300/60 rounded-xl p-3 flex flex-col gap-1 min-w-[140px] shadow-5xs text-left">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider">Active Reminders</span>
                <span className="text-xs font-mono font-bold text-stone-800 mt-1 flex items-center gap-1.5">
                  🔔 {memories.filter((m) => m.isNotiflyAlertEnabled).length} Set
                </span>
              </div>

              {/* Action: Fast simulate prompt */}
              <button
                type="button"
                onClick={() => {
                  if (memories.length === 0) {
                    triggerToast('No memories loaded', 'Please write a scrapbook entry before simulating alerts.', 'warning');
                    return;
                  }
                  const bells = memories.filter((m) => m.isNotiflyAlertEnabled);
                  let randMemory = memories[Math.floor(Math.random() * memories.length)];
                  if (bells.length > 0) {
                    randMemory = bells[Math.floor(Math.random() * bells.length)];
                  }
                  
                  // play notification alert
                  triggerToast(
                    '📬 New Notifly Postcard',
                    `"${randMemory.title}" anniversary is calling! Click notifications to view.`,
                    'success'
                  );

                  // Append notification log
                  const freshLog = {
                    id: `sim-${Date.now()}`,
                    title: `Nostalgia alert: ${randMemory.title}`,
                    description: `Let's reflect on this old story from ${randMemory.year}: "${randMemory.description}"`,
                    timestamp: 'Just now',
                    isFresh: true,
                    category: 'Memory'
                  };
                  setNotifs((prev) => [freshLog, ...prev]);
                }}
                className="px-4.5 py-3 bg-amber-900 border border-amber-950 text-stone-50 hover:bg-amber-850 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-100" />
                Prompt Daily Recollection
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SMART CATEGORIES GRID FOLIO */}
      <CategoriesSection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        counts={folderCounts}
      />

      {/* 6. INTERACTIVE TIMELINE ERA */}
      <main className="flex-grow bg-[#FDFCF7]">
        <TimelineSection
          memories={filteredMemories}
          onSelectMemory={setSelectedMemory}
        />
      </main>

      {/* 7. BOTTOM BANNER */}
      <footer className="border-t border-stone-200 mt-20 bg-[#f7f5ee] py-8 text-center px-4 self-stretch">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-400">
          <div className="text-left">
            <p className="font-bold text-stone-600 font-serif italic text-sm">
              DostLog, Purani Yade — The Handcrafted Scrapbook
            </p>
            <p className="mt-1">
              Encrypted locally in your private sandbox web client. No servers trace your heartbeats.
            </p>
          </div>
          <div className="flex gap-4">
            <span>STABILITY LEVEL: 100% OFFLINE</span>
            <span>Est. 2026</span>
          </div>
        </div>
      </footer>

      {/* 8. MODAL WINDOWS CONTROLLER */}
      <AnimatePresence>
        {/* Memory Details Modal */}
        {selectedMemory && (
          <MemoryModal
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeleteMemory}
            onToggleNotifly={handleToggleNotifly}
            triggerToast={triggerToast}
            onPrev={handlePrevDetail}
            onNext={handleNextDetail}
            hasPrev={hasPrevDetail}
            hasNext={hasNextDetail}
          />
        )}

        {/* Framing / Creator Modal */}
        {isUploadOpen && (
          <UploadMemoryModal
            onClose={() => setIsUploadOpen(false)}
            onAddMemory={handleAddMemory}
            triggerToast={triggerToast}
          />
        )}
      </AnimatePresence>

      {/* 9. NOTIFLY DYNAMIC TOAST NOTIFICATIONS DRAWER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" id="notifly-toaster-drawer">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 pointer-events-auto bg-white/95 backdrop-blur-md ${
                toast.type === 'success' 
                  ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-sm' 
                  : toast.type === 'warning' 
                    ? 'border-amber-200 bg-amber-50/95 text-amber-950 shadow-sm' 
                    : toast.type === 'error'
                      ? 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-sm'
                      : 'border-stone-200 bg-stone-50/95 text-stone-950 shadow-sm'
              }`}
              id={`notifly-toast-${toast.id}`}
            >
              <div className="mt-0.5">
                {toast.type === 'success' ? (
                  <Check className="h-4.5 w-4.5 text-emerald-700" />
                ) : toast.type === 'warning' ? (
                  <Bell className="h-4.5 w-4.5 text-amber-800" />
                ) : toast.type === 'error' ? (
                  <X className="h-4.5 w-4.5 text-rose-700" />
                ) : (
                  <Sparkles className="h-4.5 w-4.5 text-amber-900 animate-pulse" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs uppercase font-mono font-bold tracking-wider leading-none">
                  {toast.title}
                </h4>
                <p className="text-xs leading-relaxed text-stone-600 mt-1">
                  {toast.description}
                </p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter(t => t.id !== toast.id))}
                className="p-0.5 hover:bg-stone-200/50 rounded transition-colors text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
