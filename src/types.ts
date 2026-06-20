export type MemoryCategory = 'Family' | 'Friends' | 'Trips' | 'School/College Days';

export type MemoryEmotion = 'Happy' | 'Nostalgic' | 'Peaceful' | 'Excited' | 'Melancholic';

export interface Memory {
  id: string;
  title: string;
  description: string; // Short text
  backstory: string;   // Full emotional backstory
  year: number;
  date: string;        // Full date display e.g. "June 14, 2018"
  imageUrl: string;
  category: MemoryCategory;
  emotion: MemoryEmotion;
  location: string;    // Geotag
  isFavorite?: boolean;
  isNotiflyAlertEnabled?: boolean;
}
