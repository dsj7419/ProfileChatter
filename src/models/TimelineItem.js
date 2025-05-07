/**
 * TimelineItem.js
 * Base class for all timeline items (messages and typing indicators)
 * Single Responsibility: Define common properties for timeline items
 */

/**
 * Abstract base class for all timeline items
 */
class TimelineItem {
  /**
   * @param {string} sender - Who sent this item ("me" or "visitor")
   * @param {number} startTime - When this item appears (ms)
   * @param {number} y - Vertical position in the timeline
   */
  constructor(sender, startTime, y) {
    if (new.target === TimelineItem) {
      throw new Error('TimelineItem is abstract and cannot be instantiated directly');
    }
    
    this.sender = sender;
    this.startTime = startTime;
    this.y = y;
  }
  
  /**
   * Get CSS animation delay property
   * @returns {string} CSS animation-delay property
   */
  getDelayCSS() {
    return `animation-delay:${(this.startTime / 1000).toFixed(2)}s`;
  }
}

/**
 * Typing indicator timeline item
 */
export class TypingIndicator extends TimelineItem {
  /**
   * @param {string} sender - Who is typing ("me" or "visitor")
   * @param {number} startTime - When typing starts (ms)
   * @param {number} y - Vertical position
   * @param {number} duration - How long typing lasts (ms)
   */
  constructor(sender, startTime, y, duration) {
    super(sender, startTime, y);
    this.type = 'typing';
    this.duration = duration;
  }
}

/**
 * Chat message timeline item
 */
export class ChatMessage extends TimelineItem {
  /**
   * @param {string} sender - Who sent the message ("me" or "visitor")
   * @param {number} startTime - When message appears (ms) 
   * @param {number} y - Vertical position
   * @param {string} text - Message content
   * @param {Object} layout - Layout dimensions
   * @param {string} reaction - Optional emoji reaction
   */
  constructor(sender, startTime, y, text, layout, reaction) {
    super(sender, startTime, y);
    this.type = 'message';
    this.text = text;
    this.layout = layout;
    this.reaction = reaction; // Optional emoji reaction
  }
}