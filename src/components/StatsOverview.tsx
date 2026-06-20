import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Camera, Heart, Sparkles, HelpCircle, FileText, Gift, Shuffle } from 'lucide-react';
import { Memory } from '../types';

interface StatsOverviewProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
}

// Retro quotes about nostalgia and preserving memories
const QUOTES = [
  { text: "Remembrance of things past is not necessarily the remembrance of things as they were.", author: "Marcel Proust" },
  { text: "We do not remember days, we remember moments.", author: "Cesare Pavese" },
  { text: "The heart of memory is always young.", author: "Nostalgic proverb" },
  { text: "Memory is a way of holding onto the things you love, the things you are, the things you never want to lose.", author: "The Wonder Years" },
  { text: "Nostalgia is the sweet scent of a rain that fell long ago on a warm street.", author: "Scribbler's journal" }
];

export default function StatsOverview({ memories, onSelectMemory }: StatsOverviewProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [randomMemory, setRandomMemory] = useState<Memory | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Rotate custom nostalgic quote
  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  // Select a random nostalgic memory to recall in the surprise envelope
  const triggerRandomRecall = () => {
    if (memories.length === 0) return;
    setIsRevealed(false);
    
    // Choose randomly
    const randomIndex = Math.floor(Math.random() * memories.length);
    const selected = memories[randomIndex];
    
    // Animate transition softly
    setTimeout(() => {
      setRandomMemory(selected);
      setIsRevealed(true);
    }, 150);
  };

  // Compute stat dynamics
  const totalCount = memories.length;
  const favoriteCount = memories.filter((m) => m.isFavorite).length;
  
  const years = memories.map((m) => m.year);
  const oldestYear = years.length > 0 ? Math.min(...years) : 'N/A';
  
  // Find dominant emotional vibe
  const emotionsMap = memories.reduce((acc, curr) => {
    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let dominantVibe = 'Peaceful 🌿';
  let maxVibeCount = 0;
  Object.entries(emotionsMap).forEach(([emotion, count]) => {
    if (count > maxVibeCount) {
      maxVibeCount = count;
      dominantVibe = emotion;
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-overview-root">
      
      {/* STAT 1: The Almanac Index Counters */}
      <div className="bg-[#fbfcfa] border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-stone-500 mb-4">
            <Camera size={16} className="text-amber-800" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Digital Stats Desk</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-mono text-stone-400">ARCHIVED ERA ITEMS</p>
              <p className="font-serif text-3xl font-extrabold text-stone-800 mt-1 select-all">{totalCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-stone-400">FAVORED HEIRLOOMS</p>
              <p className="font-serif text-3xl font-extrabold text-stone-800 mt-1 text-rose-800 flex items-center gap-1.5 select-all">
                {favoriteCount} <Heart size={18} fill="currentColor" className="inline-block animate-pulse" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-stone-400">OLDEST MILESTONE</p>
              <p className="font-serif text-xl font-bold text-stone-700 mt-1 select-all">{oldestYear}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-stone-400">DOMINANT VIBE</p>
              <p className="font-serif text-sm font-bold text-amber-950 mt-1.5 select-all">{dominantVibe}</p>
            </div>
          </div>
        </div>

        {/* Short system stamp */}
        <div className="border-t border-stone-200/50 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-stone-400">
          <span>Stamper: SECURE LOCAL STORAGE</span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* STAT 2: The Nostalgic Poetry Scroll */}
      <div className="bg-[#FAF8F3] border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-4">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-800" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Nostalgic Wisdom</span>
            </div>
            {/* Spinning refresh quote */}
            <button
              onClick={rotateQuote}
              className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
              title="Next Poetry Scroll"
            >
              <Shuffle size={12} />
            </button>
          </div>

          <div className="relative min-h-[90px] flex items-center">
            {/* Soft poetic entry */}
            <p className="font-serif italic text-stone-700 text-sm leading-relaxed">
              “ {QUOTES[quoteIndex].text} ”
            </p>
          </div>
        </div>

        <div className="text-right mt-4 pt-3 border-t border-stone-200/40">
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-900">- {QUOTES[quoteIndex].author}</p>
        </div>
      </div>

      {/* STAT 3: The Random Memory Recall Surprise Envelope */}
      <div className="bg-[#FAF6EE] border border-[#dfd2be] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-stone-500 mb-3">
            <Gift size={16} className="text-amber-800" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Spontaneous Recall</span>
          </div>

          {randomMemory ? (
            <AnimatePresence mode="wait">
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-3"
                  style={{ contentVisibility: 'auto' }}
                >
                  <div className="flex gap-3">
                    <img
                      src={randomMemory.imageUrl}
                      alt={randomMemory.title}
                      className="w-12 h-12 rounded object-cover border border-stone-300"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif italic font-bold text-xs text-stone-800">
                        {randomMemory.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {randomMemory.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 font-serif line-clamp-2 italic">
                    “{randomMemory.description}”
                  </p>
                  
                  <button
                    onClick={() => onSelectMemory(randomMemory)}
                    className="text-[10px] font-mono text-amber-900 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    Unfold Backstory Journal →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="text-center py-6">
              <Shuffle className="mx-auto text-amber-700/60 mb-2 animate-bounce" size={24} />
              <p className="text-xs font-serif italic text-stone-600">
                Let fate unfold an old letter...
              </p>
            </div>
          )}
        </div>

        <button
          onClick={triggerRandomRecall}
          disabled={memories.length === 0}
          className="w-full mt-4 py-2 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-amber-50 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1 bg-amber-950 shadow-xs transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          id="btn-fate-unfold"
        >
          <Sparkles size={11} /> Spin Memory Archive
        </button>
      </div>

    </div>
  );
}
