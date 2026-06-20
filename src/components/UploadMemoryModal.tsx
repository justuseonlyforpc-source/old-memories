import React, { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Upload, MapPin, Calendar, Heart, FolderPlus, Smile, Sparkles } from 'lucide-react';
import { Memory, MemoryCategory, MemoryEmotion } from '../types';

interface UploadMemoryModalProps {
  onClose: () => void;
  onAddMemory: (memory: Omit<Memory, 'id'> | Omit<Memory, 'id'>[]) => void;
  triggerToast?: (title: string, desc: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const PRESET_PLACEHOLDERS = [
  { name: 'Warm Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Old Library', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cozy Fireplace', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
  { name: 'Vintage Field', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80' }
];

export default function UploadMemoryModal({ onClose, onAddMemory, triggerToast }: UploadMemoryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [backstory, setBackstory] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('Family');
  const [emotion, setEmotion] = useState<MemoryEmotion>('Nostalgic');
  const [isFavorite, setIsFavorite] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; name: string }>>([]);
  
  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        if (triggerToast) {
          triggerToast('Unsupported Image', `We can only frame image memory files (JPG, PNG, WebP). Skipping: ${file.name}`, 'warning');
        } else {
          alert(`We can only frame image memory files (JPG, PNG, WebP etc.)! Skipping non-image: ${file.name}`);
        }
      }
    }

    if (validFiles.length === 0) return;

    let loadedCount = 0;
    const loadedImages: Array<{ url: string; name: string }> = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedImages.push({
            url: event.target.result as string,
            name: file.name
          });
        }
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setImages((prev) => [...prev, ...loadedImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      if (triggerToast) {
        triggerToast('Upload Missing', 'Please upload a photograph or select a preset illustration for your memory card first!', 'error');
      } else {
        alert('Please upload a photograph or select a preset illustration for your memory card.');
      }
      return;
    }
    if (!title.trim() || !description.trim() || !backstory.trim()) {
      if (triggerToast) {
        triggerToast('Form Incomplete', 'Please fill out the title, short phrase, and warm backstory of your memory.', 'warning');
      } else {
        alert('Please fill out the title, description, and the warm backstory of your memory.');
      }
      return;
    }

    // Format human readable date if empty
    const finalDate = date.trim() || `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

    const newMemories: Omit<Memory, 'id'>[] = images.map((img, idx) => ({
      title: title.trim() + (images.length > 1 ? ` (${idx + 1}/${images.length})` : ''),
      description: description.trim(),
      backstory: backstory.trim(),
      year: Number(year),
      date: finalDate,
      imageUrl: img.url,
      category,
      emotion,
      location: location.trim() || 'Cozy Corner of the World',
      isFavorite
    }));

    onAddMemory(newMemories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#1e1c19]/75 backdrop-blur-sm overflow-y-auto" id="upload-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-[#fdfcf7] rounded-2xl overflow-hidden shadow-2xl border border-stone-200 mt-8 mb-8"
        id="upload-modal-container"
      >
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-stone-200 bg-[#f7f5ee] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderPlus className="text-amber-800" size={20} />
            <h3 className="font-serif text-lg font-bold text-stone-800">
              Frame a New Digital Memory
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
            id="upload-btn-close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Media Scrapbook Uploading Area */}
            <div className="space-y-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500">
                1. Photograph Frame *
              </label>

              {/* Drag n drop box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (images.length === 0) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`group border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                  images.length > 0 ? 'cursor-default' : 'cursor-pointer'
                } ${
                  isDragging 
                    ? 'border-amber-700 bg-amber-50/50' 
                    : images.length > 0 
                      ? 'border-stone-200 bg-white' 
                      : 'border-stone-300 bg-stone-50 hover:bg-stone-100/50 hover:border-stone-400'
                }`}
                style={{ contentVisibility: 'auto', minHeight: '220px' }}
                id="upload-drag-area"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {images.length > 0 ? (
                  <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto p-1">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/item border border-stone-200 shadow-xs bg-stone-50">
                          <img
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1 right-1 p-1 bg-stone-900/85 hover:bg-stone-950 text-white rounded-full transition-colors shadow-sm"
                            title="Remove photo"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Plus icon box to append more files */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-lg hover:border-amber-700 hover:bg-amber-50/10 transition-all text-stone-500 hover:text-amber-800"
                        title="Add more photos"
                      >
                        <Upload size={18} />
                        <span className="text-[10px] uppercase font-mono mt-1 font-bold">Add More</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-stone-400 border-t border-stone-100 pt-2 px-1">
                      <span>{images.length} photo{images.length > 1 ? 's' : ''} selected</span>
                      <button 
                        type="button" 
                        onClick={() => setImages([])} 
                        className="text-amber-800 hover:underline font-bold"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-[#f3efe4] rounded-full text-amber-900 mb-3 group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <p className="font-serif text-sm font-medium text-stone-800">
                      Drag your digital photo(s) here
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1 font-mono">
                      or click to explore files (multiple selection supported)
                    </p>
                  </>
                )}
              </div>

              {/* Backup Presets Selection for instant try-out */}
              <div className="pt-2">
                <p className="text-[11px] font-mono text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-700 animate-pulse" /> Or select nostalgic preset photos:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_PLACEHOLDERS.map((preset) => {
                    const isSelected = images.some((img) => img.url === preset.url);
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setImages((prev) => prev.filter((img) => img.url !== preset.url));
                          } else {
                            setImages((prev) => [...prev, { url: preset.url, name: `PRESET_${preset.name.toUpperCase()}.jpg` }]);
                          }
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected 
                            ? 'border-amber-800 scale-95 shadow-sm' 
                            : 'border-transparent hover:scale-105 hover:opacity-90'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-900/20 flex items-center justify-center">
                            <span className="text-white text-[9px] font-mono bg-amber-900 rounded px-1 py-0.5 shadow-sm">Added</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Toggle inside Creator */}
              <div className="pt-2 flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                <span className="text-xs font-serif text-stone-700 italic flex items-center gap-1.5 font-medium">
                  <Heart size={14} className="text-rose-600" /> Save directly to Favorites?
                </span>
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    isFavorite ? 'bg-rose-500' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      isFavorite ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Writing the backstory */}
            <div className="space-y-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500">
                2. Chronicle Details *
              </label>

              {/* Title input */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Memory Title (e.g. Grandma's 80th Birthday)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-stone-200 px-3.5 py-2.5 rounded-xl text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition-all font-serif font-bold text-stone-800"
                />
              </div>

              {/* Description input (short) */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Brief Caption (e.g. Laughter, cake, and accordion songs)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-stone-200 px-3.5 py-2.5 rounded-xl text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition-all text-stone-700 font-sans"
                />
              </div>

              {/* Chronological Coordinates row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 tracking-wider mb-1">
                    Chronology Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2035"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 text-stone-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 tracking-wider mb-1">
                    Display Date (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer 2018"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-stone-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 text-stone-600 font-mono"
                  />
                </div>
              </div>

              {/* Geotag Input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                    <MapPin size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Location Geotag (e.g. Redwood Forest, CA)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-stone-200 pl-9 pr-3.5 py-2 rounded-xl text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition-all text-stone-600 font-mono"
                  />
                </div>
              </div>

              {/* Category & Emotion picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 tracking-wider mb-1">
                    Scrapbook Folder
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                    className="w-full bg-white border border-stone-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-700 font-mono"
                  >
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="Trips">Trips</option>
                    <option value="School/College Days">School & College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 tracking-wider mb-1">
                    Emotional Vibe
                  </label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value as MemoryEmotion)}
                    className="w-full bg-white border border-stone-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-700 font-mono"
                  >
                    <option value="Happy">Happy 😊</option>
                    <option value="Nostalgic">Nostalgic 🕯️</option>
                    <option value="Peaceful">Peaceful 🌿</option>
                    <option value="Excited">Excited ✨</option>
                    <option value="Melancholic">Melancholic 🍂</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* BACKSTORY: Writable Journal Space */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500">
                3. The Backstory (Scribble your handwritten memory entry) *
              </label>
              <span className="text-[10px] text-stone-400 font-mono italic">
                Serif notebook-entry style
              </span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Scribble the full detailed backstory. Describe the sounds, scents, moods, and feelings associated with this very screenshot of your life..."
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              className="w-full bg-[#fdfaf2] border border-stone-200/80 p-4 rounded-xl text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition-all font-serif italic text-stone-800 leading-relaxed shadow-inner"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-mono border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-mono bg-amber-900 border border-amber-950 text-amber-50 hover:bg-amber-800 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              id="upload-btn-submit"
            >
              Archive Memory Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
