import { useState } from 'react';
import { MapPin, Calendar, BookOpen, ArrowUpDown, Flame, Sparkles } from 'lucide-react';
import { Memory } from '../types';

interface TimelineSectionProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
}

export default function TimelineSection({ memories, onSelectMemory }: TimelineSectionProps) {
  const [ascending, setAscending] = useState(true);

  // Sort memories chronologically by year/date
  const sortedMemories = [...memories].sort((a, b) => {
    return ascending ? a.year - b.year : b.year - a.year;
  });

  return (
    <div className="py-12 max-w-5xl mx-auto px-4" id="timeline-section-root">
      {/* Timeline Controls & Info */}
      <div className="flex items-center justify-between mb-12 border-b border-stone-200/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-800 animate-pulse" />
          <h2 className="font-serif text-2xl font-bold text-stone-850">
            The Timeline Epochs
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
            {sortedMemories.length} Archived
          </span>
        </div>

        {/* Sort descending/ascending button */}
        <button
          onClick={() => setAscending(!ascending)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-mono text-stone-700 transition-all hover:scale-102 active:scale-98 shadow-xs"
          title={ascending ? "Showing Oldest First" : "Showing Newest First"}
          id="btn-sort-chronology"
        >
          <ArrowUpDown size={12} />
          <span>{ascending ? 'Oldest Era First' : 'Newest Era First'}</span>
        </button>
      </div>

      {sortedMemories.length === 0 ? (
        <div className="text-center py-16 bg-[#faf8f3] rounded-2xl border border-dashed border-stone-300 p-8">
          <BookOpen className="mx-auto text-stone-400 mb-3" size={32} />
          <p className="font-serif italic text-stone-600 text-sm">
            None of our framed memories belong to this epoch.
          </p>
          <p className="text-xs text-stone-400 font-mono mt-1">
            Try resetting your search query or choosing another folder above.
          </p>
        </div>
      ) : (
        <div className="relative" id="timeline-v-container">
          {/* Central Line for timeline (Desktop only, centered) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-850/60 via-amber-700/20 to-amber-900/10 md:-translate-x-1/2 select-none pointer-events-none" />

          {/* Timeline Node List */}
          <div className="space-y-12 md:space-y-16">
            {sortedMemories.map((memory, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={memory.id} 
                  className={`flex flex-col md:flex-row relative z-10 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  id={`timeline-node-${memory.id}`}
                >
                  {/* Timeline Badge (Desktop: centered circle, Mobile: left aligned circle) */}
                  <div className="absolute left-4 md:left-1/2 top-3 w-8 h-8 rounded-full bg-[#fcfaf2] border-2 border-amber-900 md:-translate-x-1/2 flex items-center justify-center font-mono text-[10px] font-bold text-amber-950 shadow-md ring-4 ring-[#fcfaf2]">
                    <span className="sr-only">Year of memory</span>
                    {memory.year.toString().slice(-2)}
                  </div>

                  {/* Spacer column (Takes up 50% width on opposite side of timeline on Desktop) */}
                  <div className="w-full md:w-1/2 text-left md:text-right px-6 md:px-12 pointer-events-none hidden md:block" />

                  {/* ACTIVE SIDE CARD CONTAINER (Takes remaining 50% width) */}
                  <div 
                    className={`w-full md:w-1/2 pl-12 pr-6 md:px-12 flex ${
                      isEven ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {/* Interacting instructions text hint on hover */}
                    <div className="w-full max-w-[340px]">
                      
                      {/* Interactive 3D flip card */}
                      <div className="group h-[380px] perspective-1000 w-full cursor-pointer">
                        <div 
                          className="relative w-full h-full duration-700 transform-style-3d group-hover:rotate-y-180"
                          id={`flip-card-inner-${memory.id}`}
                        >
                          {/* CARD FRONT SIDE: Elegant Polaroid Frame */}
                          <div 
                            onClick={() => onSelectMemory(memory)}
                            className="absolute inset-0 backface-hidden bg-white p-4 pb-6 rounded-2xl shadow-md border border-stone-200/80 flex flex-col justify-between transform transition-transform"
                          >
                            <div className="relative w-full aspect-1.1/1 bg-stone-100 overflow-hidden rounded-xl border border-stone-100">
                              <img
                                src={memory.imageUrl}
                                alt={memory.title}
                                className="w-full h-full object-cover grayscale-10 hover:grayscale-0 transition-all duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#fdfcf7] text-[#2d2a26] text-[10px] uppercase tracking-widest font-mono rounded shadow">
                                {memory.year}
                              </div>
                            </div>

                            {/* Caption of Polaroid */}
                            <div className="mt-4 flex flex-col items-center text-center">
                              <h4 className="font-serif italic font-bold text-base text-stone-850 transition-colors group-hover:text-amber-950">
                                {memory.title}
                              </h4>
                              <p className="text-[11px] font-mono text-stone-400 mt-1 uppercase tracking-wide">
                                {memory.category} • {memory.emotion}
                              </p>
                              {/* Soft tap-to-flip indicator */}
                              <span className="text-[9px] font-mono tracking-widest text-[#9d8d75] mt-3 uppercase animate-pulse">
                                Hover to turn over
                              </span>
                            </div>
                          </div>

                          {/* CARD BACK SIDE: Handwritten journaling excerpt */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#f9f6ef] p-6 rounded-2xl shadow-lg border-2 border-[#dfd2be] flex flex-col justify-between">
                            <div>
                              {/* Retro design details */}
                              <div className="flex items-center justify-between border-b border-[#dfd2be]/60 pb-2 mb-4">
                                <span className="font-mono text-[10px] text-[#8c7453] uppercase tracking-widest">
                                  Aged Journal Entry
                                </span>
                                <div className="flex gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfd2be]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfd2be]" />
                                </div>
                              </div>

                              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-900 mb-1">
                                <Calendar size={10} /> {memory.date}
                              </span>

                              <h4 className="font-serif font-bold text-stone-800 text-lg leading-snug mb-2">
                                {memory.title}
                              </h4>

                              <p className="font-serif italic text-xs leading-5 text-stone-600 line-clamp-5 mt-3 select-none">
                                “ {memory.description} ”
                              </p>
                            </div>

                            {/* Card back footer */}
                            <div className="mt-4 pt-3 border-t border-[#dfd2be]/40">
                              {memory.location && (
                                <div className="flex items-center gap-1 text-[10px] text-stone-500 font-mono mb-3 truncate">
                                  <MapPin size={10} className="text-amber-800" />
                                  <span>{memory.location}</span>
                                </div>
                              )}

                              {/* Button to read deep backstory */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent flip triggers from interfering click
                                  onSelectMemory(memory);
                                }}
                                className="w-full py-2 bg-amber-900 hover:bg-amber-800 text-stone-50 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                id={`btn-read-backstory-${memory.id}`}
                              >
                                <BookOpen size={11} /> Read Backstory Journal
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
