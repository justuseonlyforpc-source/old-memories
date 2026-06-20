import { Folder, Heart, Sparkles, Smile, GraduationCap, Map, Users, Globe } from 'lucide-react';
import { MemoryCategory } from '../types';

interface CategoriesSectionProps {
  selectedCategory: MemoryCategory | 'All' | 'Favorites';
  onSelectCategory: (category: MemoryCategory | 'All' | 'Favorites') => void;
  counts: Record<string, number>;
}

export default function CategoriesSection({
  selectedCategory,
  onSelectCategory,
  counts
}: CategoriesSectionProps) {
  
  // Folder layout properties
  const folders = [
    {
      id: 'All' as const,
      label: 'All Memories',
      description: 'The complete book of precious vintage milestones.',
      icon: Globe,
      colorClass: 'bg-[#faf6eb] text-stone-800 border-[#eae0cc]',
      accentColor: 'bg-stone-200 text-stone-700',
      tag: 'all'
    },
    {
      id: 'Favorites' as const,
      label: 'Favorites',
      description: 'The golden moments marked close to your heart.',
      icon: Heart,
      colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
      accentColor: 'bg-rose-100 text-rose-600',
      tag: 'star'
    },
    {
      id: 'Family' as const,
      label: 'Family',
      description: 'Sunday dinners, baby steps, and grandparent stories.',
      icon: Users,
      colorClass: 'bg-amber-50 text-amber-900 border-amber-200',
      accentColor: 'bg-amber-100 text-amber-800',
      tag: 'family'
    },
    {
      id: 'Friends' as const,
      label: 'Friends',
      description: 'Late night diner runs, shared secrets, and wild laughter.',
      icon: Smile,
      colorClass: 'bg-[#fdf2f4] text-rose-900 border-[#fadce1]',
      accentColor: 'bg-[#fadce1] text-rose-700',
      tag: 'friends'
    },
    {
      id: 'Trips' as const,
      label: 'Trips',
      description: 'Sandy roadtrips, flights, and campfire starfields.',
      icon: Map,
      colorClass: 'bg-sky-50 text-sky-900 border-sky-200',
      accentColor: 'bg-sky-100 text-sky-700',
      tag: 'trips'
    },
    {
      id: 'School/College Days' as const,
      label: 'School/College Days',
      description: 'Graduations, first lockers, final exam celebrations.',
      icon: GraduationCap,
      colorClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      accentColor: 'bg-emerald-100 text-emerald-700',
      tag: 'school'
    }
  ];

  return (
    <div className="py-10 max-w-5xl mx-auto px-4" id="categories-section-root">
      
      {/* Grid section description */}
      <div className="mb-6 flex items-center gap-2">
        <Sparkles size={16} className="text-amber-800 animate-pulse" />
        <h3 className="font-serif text-lg font-bold text-stone-800">
          Smart Scrapbook Cabinets
        </h3>
        <span className="text-[11px] font-mono text-[#a3947e] uppercase tracking-widest hidden sm:inline">
          — Select a drawer to sift eras
        </span>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="categories-folders-grid">
        {folders.map((folder) => {
          const isSelected = selectedCategory === folder.id;
          const count = counts[folder.id] || 0;
          const FolderIcon = folder.icon;

          return (
            <button
              key={folder.id}
              onClick={() => onSelectCategory(folder.id)}
              className={`group relative text-left rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between hover:scale-102 focus:outline-none min-h-[140px] ${
                isSelected 
                  ? `${folder.colorClass} ring-2 ring-amber-900 shadow-md translate-y-[-2px]` 
                  : 'bg-[#fcfbf9] border-stone-200/90 text-stone-700 hover:border-stone-300 shadow-xs'
              }`}
              id={`btn-category-folder-${folder.tag}`}
            >
              {/* Folder Tab decoration simulating real filing index tab */}
              <div 
                className={`absolute top-[-8px] left-4 h-2 w-12 rounded-t-md transition-all ${
                  isSelected ? 'bg-amber-900 opacity-90' : 'bg-stone-300 opacity-40 group-hover:opacity-75'
                }`} 
              />

              {/* Icon Row */}
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl border transition-all ${
                  isSelected ? folder.accentColor : 'bg-stone-50 border-stone-200 text-stone-500 group-hover:text-amber-900 group-hover:bg-amber-50 group-hover:border-amber-100'
                }`}>
                  <FolderIcon size={16} />
                </div>
                
                {/* File Count Circle */}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/80 border' : 'bg-stone-100 border'
                } font-bold text-stone-600`}>
                  {count}
                </span>
              </div>

              {/* Title & Description Column */}
              <div className="mt-4">
                <h4 className="font-serif font-bold text-xs md:text-sm tracking-tight text-stone-850 group-hover:text-amber-950">
                  {folder.label}
                </h4>
                <p className="text-[10px] text-stone-400 font-sans line-clamp-2 mt-1 select-none leading-relaxed hidden md:block">
                  {folder.description}
                </p>
              </div>

              {/* Selected Bottom Indicator bar */}
              {isSelected && (
                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-850" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
