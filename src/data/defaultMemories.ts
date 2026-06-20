import { Memory } from '../types';

import picnicImg from '../assets/images/memory_picnic_1781983306543.jpg';
import roadtripImg from '../assets/images/memory_roadtrip_1781983321844.jpg';
import collegeImg from '../assets/images/memory_college_1781983337076.jpg';
import holidayImg from '../assets/images/memory_holiday_1781983353016.jpg';

export const DEFAULT_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    title: 'Sunday Picnic at the Green Hills',
    description: 'Sipping hand-squeezed lemonade with the whole family under the gentle afternoon sun.',
    backstory: 'This was the first time in years we all made it back to the old meadow. Grandma baked her signature strawberry rhubarb pie, and we spent hours trying to fly a stubborn yellow kite. It was breezy, laugh-filled, and perfectly warm. Looking at this picture always brings back the scent of fresh pine needles and warm pie crust.',
    year: 2015,
    date: 'May 24, 2015',
    imageUrl: picnicImg,
    category: 'Family',
    emotion: 'Peaceful',
    location: 'Pinecrest Meadow, Oregon',
    isFavorite: true
  },
  {
    id: 'mem-2',
    title: 'The Great Coastline Escape',
    description: 'Blasting 80s synth tracks with windows rolled down and ocean spray on our faces.',
    backstory: 'It was a spontaneous decision on a hot Tuesday. We packed three duffel bags, grabbed a crate of vintage soda bottles, and just drove west towards the sunset. This polaroid was snapped on the side of Highway 1, just as the sun touched the horizon and turned the world into absolute solid amber. We didn\'t have a hotel booked, but we had the best night of our lives.',
    year: 2018,
    date: 'August 12, 2018',
    imageUrl: roadtripImg,
    category: 'Trips',
    emotion: 'Excited',
    location: 'Pacific Coast Highway, CA',
    isFavorite: true
  },
  {
    id: 'mem-3',
    title: 'The Golden Oak Graduation Eve',
    description: 'Celebrating our last final exam on the lawns, throwing caps under the campus oak.',
    backstory: 'Our final year had felt incredibly fast, but on this evening, time slowed down completely. We sat under the campus\'s legendary 300-year-old oak tree recounting all the late-night diner runs, the failed physics labs, and the lifelong bonds we formed here. The air shifted and got a bit chilly, but none of us wanted to leave. It was the perfect bridge between our youth and whatever lay ahead.',
    year: 2022,
    date: 'June 08, 2022',
    imageUrl: collegeImg,
    category: 'School/College Days',
    emotion: 'Nostalgic',
    location: 'University Quadrangle, MA',
    isFavorite: false
  },
  {
    id: 'mem-4',
    title: 'Midnight Bonfire & Sea Air',
    description: 'Spoke of dreams and futures while watching embers fly into the starry coastal sky.',
    backstory: 'The tide had retreated, exposing dark sand glistening under a brilliant moon. We built a small drift-wood bonfire. The crackling sound blended with the rhythmic crash of gentle waves. We didn\'t check our phones once—just drank tea, sang old campfire tunes, and stared into the high velvet sky, feeling small yet fully connected.',
    year: 2024,
    date: 'July 19, 2024',
    imageUrl: holidayImg,
    category: 'Trips',
    emotion: 'Happy',
    location: 'Ruby Beach, Washington',
    isFavorite: false
  }
];
