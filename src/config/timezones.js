/**
 * timezones.js
 * Provides a list of common IANA timezone identifiers organized by region
 * Single Responsibility: Store timezone data for the application
 */

export const timezones = [
    // Common US/North American Timezones
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'America/Anchorage', label: 'Alaska' },
    { value: 'Pacific/Honolulu', label: 'Hawaii' },
    { value: 'America/Toronto', label: 'Toronto' },
    { value: 'America/Vancouver', label: 'Vancouver' },
    { value: 'America/Mexico_City', label: 'Mexico City' },
    
    // Europe
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris, Berlin, Rome (CET)' },
    { value: 'Europe/Athens', label: 'Athens, Helsinki (EET)' },
    { value: 'Europe/Moscow', label: 'Moscow' },
    { value: 'Europe/Dublin', label: 'Dublin' },
    { value: 'Europe/Lisbon', label: 'Lisbon' },
    
    // Asia/Pacific
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi' },
    { value: 'Asia/Seoul', label: 'Seoul' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'Australia/Melbourne', label: 'Melbourne' },
    { value: 'Australia/Perth', label: 'Perth' },
    { value: 'Pacific/Auckland', label: 'Auckland' },
    
    // South America
    { value: 'America/Sao_Paulo', label: 'São Paulo' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
    { value: 'America/Santiago', label: 'Santiago' },
    
    // Africa
    { value: 'Africa/Johannesburg', label: 'Johannesburg' },
    { value: 'Africa/Cairo', label: 'Cairo' },
    { value: 'Africa/Lagos', label: 'Lagos' },
    
    // UTC
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
  ];
  
  export const timezonesByValue = timezones.reduce((acc, tz) => {
    acc[tz.value] = tz.label;
    return acc;
  }, {});
  
  export const getTimezoneLabel = (value) => {
    return timezonesByValue[value] || value;
  };