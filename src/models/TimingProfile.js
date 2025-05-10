/**
 * TimingProfile.js
 * Centralised timing-data object produced by TimelineBuilder and consumed by
 * SvgRenderer and other components.
 * Single Responsibility: Store animation timing data
 */

export default class TimingProfile {
    /**
     * @param {number} scrollPixelsPerSec - Effective scrolling speed
     * @param {number} scrollDurationSec - Duration required to cover scrollDistance
     * @param {number} scrollDistance - The total distance to scroll in pixels
     * @param {{ typingMs: number, readingMs: number, senderDelayMs: number }[]} perMessage - Timing info per message
     */
    constructor(scrollPixelsPerSec, scrollDurationSec, scrollDistance, perMessage) {
      this.scrollPixelsPerSec = scrollPixelsPerSec;
      this.scrollDurationSec = scrollDurationSec;
      this.scrollDistance = scrollDistance;
      this.perMessage = perMessage;
    }
    
    /**
     * Calculate total animation duration including typing, reading, and scrolling
     * @param {number} endBufferMs - Additional buffer time at the end
     * @returns {number} - Total animation duration in milliseconds
     */
    getTotalDuration(endBufferMs = 0) {
      const messagingTime = this.perMessage.reduce((total, msg) => 
        total + msg.typingMs + msg.readingMs + msg.senderDelayMs, 0);
      
      return messagingTime + (this.scrollDurationSec * 1000) + endBufferMs;
    }
    
    /**
     * Get the sum of all typing durations
     * @returns {number} - Total typing time in milliseconds
     */
    getTotalTypingTime() {
      return this.perMessage.reduce((total, msg) => total + msg.typingMs, 0);
    }
  }