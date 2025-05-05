// src/dynamicData.js
import { format, formatDistanceToNow } from 'date-fns';

export async function getDynamicData() {
  const now = new Date();

  return {
    currentDayOfWeek: format(now, 'EEEE'),
    currentDate     : format(now, 'MMMM d, yyyy'),
    workTenure      : formatDistanceToNow(new Date(2022, 0, 1)), // demo start date
    temperature     : '--°F (--°C)',
    weatherDescription: 'weather unavailable',
    emoji           : '👋',
    githubPublicRepos: 'N/A',
    githubFollowers  : 'N/A',
    // static items used in your JSON:
    name           : 'Dan Johnson',
    profession     : 'Software Developer',
    location       : 'San Diego',
    company        : 'Encore',
    currentProject : 'ProfileChatter SVG Generator'
  };
}
