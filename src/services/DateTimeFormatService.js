/**
 * DateTimeFormatService.js
 * Responsible for all date and time formatting operations
 * Single Responsibility: Date/time formatting with timezone support
 */

class DateTimeFormatService {
    constructor() {
      // Default language for formatting
      this.language = 'en-US';
    }
  
    /**
     * Format the current date/time with the specified timezone
     * @param {Object} options Formatting options
     * @param {string} timezone IANA timezone identifier
     * @returns {Object} Formatted date/time components
     */
    formatCurrentDateTime(timezone = 'UTC') {
      const now = new Date();
      
      try {
        // Create various formatters for different date/time components
        const dayOfWeekFormatter = new Intl.DateTimeFormat(this.language, { 
          weekday: 'long', 
          timeZone: timezone 
        });
        
        const shortDayOfWeekFormatter = new Intl.DateTimeFormat(this.language, { 
          weekday: 'short', 
          timeZone: timezone 
        });
        
        const monthFormatter = new Intl.DateTimeFormat(this.language, { 
          month: 'long', 
          timeZone: timezone 
        });
        
        const shortMonthFormatter = new Intl.DateTimeFormat(this.language, { 
          month: 'short', 
          timeZone: timezone 
        });
        
        const dateFormatter = new Intl.DateTimeFormat(this.language, { 
          day: 'numeric', 
          timeZone: timezone 
        });
        
        const yearFormatter = new Intl.DateTimeFormat(this.language, { 
          year: 'numeric', 
          timeZone: timezone 
        });
        
        const timeFormatter = new Intl.DateTimeFormat(this.language, { 
          hour: 'numeric', 
          minute: 'numeric', 
          timeZone: timezone 
        });
        
        const time24Formatter = new Intl.DateTimeFormat(this.language, { 
          hour: 'numeric', 
          minute: 'numeric', 
          hour12: false, 
          timeZone: timezone 
        });
        
        const fullDateFormatter = new Intl.DateTimeFormat(this.language, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          timeZone: timezone 
        });
        
        const fullDateTimeFormatter = new Intl.DateTimeFormat(this.language, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric', 
          timeZone: timezone 
        });
        
        // Return an object with all formatted components
        return {
          // Original format placeholders (maintained for backward compatibility)
          currentDayOfWeek: dayOfWeekFormatter.format(now),
          currentDate: fullDateFormatter.format(now),
          
          // New granular placeholders
          dayName: dayOfWeekFormatter.format(now),
          dayNameShort: shortDayOfWeekFormatter.format(now),
          monthName: monthFormatter.format(now),
          monthNameShort: shortMonthFormatter.format(now),
          day: dateFormatter.format(now),
          year: yearFormatter.format(now),
          time: timeFormatter.format(now),
          time24: time24Formatter.format(now),
          dateTime: fullDateTimeFormatter.format(now),
          
          // Include timezone info
          timezone: timezone,
          timezoneAbbr: this.getTimezoneAbbreviation(now, timezone)
        };
      } catch (error) {
        console.error(`DateTimeFormatService: Error formatting date/time with timezone "${timezone}":`, error);
        
        // Fallback to UTC in case of error
        return this.formatCurrentDateTime('UTC');
      }
    }
    
    /**
     * Calculate work tenure based on start date
     * @param {Date} startDate Work start date
     * @returns {string} Formatted work tenure
     */
    formatWorkTenure(startDate) {
      if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      let y = now.getFullYear() - startDate.getFullYear();
      let m = now.getMonth() - startDate.getMonth();
      let d = now.getDate() - startDate.getDate();
      
      if (d < 0) { 
        m--; 
        d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); 
      }
      
      if (m < 0) { 
        y--; 
        m += 12; 
      }
      
      const parts = [];
      if (y) parts.push(`${y} year${y!==1?'s':''}`);
      if (m) parts.push(`${m} month${m!==1?'s':''}`);
      if (d) parts.push(`${d} day${d!==1?'s':''}`);
      
      return parts.length 
        ? (parts.length===1 ? parts[0] : parts.slice(0,-1).join(', ')+' and '+parts.slice(-1)) 
        : '0 days';
    }
    
    /**
     * Get the abbreviation for a timezone
     * @param {Date} date Date to get timezone for
     * @param {string} timezone IANA timezone
     * @returns {string} Timezone abbreviation
     */
    getTimezoneAbbreviation(date, timezone) {
      try {
        // This is a bit of a hack to get timezone abbreviation
        // Format the date with the timezone name and extract it
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZoneName: 'short',
          timeZone: timezone
        });
        
        const parts = formatter.formatToParts(date);
        const timeZonePart = parts.find(part => part.type === 'timeZoneName');
        
        return timeZonePart ? timeZonePart.value : timezone;
      } catch (error) {
        console.error(`Error getting timezone abbreviation for "${timezone}":`, error);
        return timezone;
      }
    }
  }
  
  // Create and export a singleton instance
  export default new DateTimeFormatService();