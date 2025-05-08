/**
 * TimelineBuilder.js
 * Responsible for building the animation timeline with correct positioning
 * Single Responsibility: Create and manage the timeline of chat events
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TypingIndicator, ChatMessage } from '../models/TimelineItem.js';
import { config } from '../config/config.js';
import TextProcessor from '../utils/TextProcessor.js';

class TimelineBuilder {
  constructor() {
    try {
      // Load chat data
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const chatDataPath = join(__dirname, '../../data/chatData.json');
      this.chatData = JSON.parse(readFileSync(chatDataPath, 'utf8'));
    } catch (error) {
      console.error('Error loading chat data:', error);
      // Provide fallback minimal chat data
      this.chatData = [
        { id: "error-1", sender: "me", text: "Error loading chat data. Please check your configuration." }
      ];
    }
  }
  
  /**
   * Calculate appropriate typing time based on message length
   * @param {string} text - Message text
   * @returns {number} - Duration in milliseconds
   */
  calculateTypingTime(text) {
    // Typing time correlates with message length but has reasonable bounds
    return Math.min(
      config.layout.TYPING_MAX_MS,
      Math.max(config.layout.TYPING_MIN_MS, text.length * config.layout.TYPING_CHAR_MS)
    );
  }
  
  /**
   * Calculate reading time for a message based on content length
   * @param {string} text - Message text
   * @returns {number} - Duration in milliseconds
   */
  calculateReadingTime(text) {
    // Calculate reading time based on word count
    const wordCount = text.split(/\s+/).length;
    const baseReadingTime = config.layout.TIMING.MIN_READING_TIME_MS;
    const readingTime = Math.max(
      baseReadingTime, 
      wordCount * config.layout.TIMING.MS_PER_WORD
    );
    
    // Add random variation to make it feel more natural
    return readingTime + (Math.random() * config.layout.TIMING.READING_RANDOMNESS_MS);
  }
  
  /**
   * Calculate natural pause between messages based on sender change
   * @param {string} currentSender - Current message sender
   * @param {string} previousSender - Previous message sender
   * @returns {number} - Pause duration in milliseconds
   */
  calculateSenderTransitionDelay(currentSender, previousSender) {
    // Add extra delay when sender changes (simulating conversation turn-taking)
    if (!previousSender || currentSender === previousSender) {
      return config.layout.TIMING.SAME_SENDER_DELAY_MS;
    }
    return config.layout.TIMING.SENDER_CHANGE_DELAY_MS;
  }

  /**
   * Calculate dimensions for a chart message
   * @param {Object} chartData - Chart data object
   * @returns {Object} - Dimensions { width, height }
   */
  _calculateChartDimensions(chartData) {
    const themeStyles = config.themes[config.activeTheme] || config.themes.ios;
    const chartStyles = themeStyles.CHART_STYLES;
    
    // Initialize with padding
    let totalHeight = chartStyles.CHART_PADDING_Y_PX * 2;
    
    // Add title height if present
    if (chartData.title) {
      totalHeight += chartStyles.TITLE_FONT_SIZE_PX + 14; // Title + spacing
    }
    
    // Calculate height for all bars
    const itemCount = chartData.items?.length || 0;
    if (itemCount > 0) {
      totalHeight += (itemCount * chartStyles.BAR_HEIGHT_PX) + 
                     ((itemCount - 1) * chartStyles.BAR_SPACING_PX);
    }
    
    // Set chart width to maximum bubble width for consistency
    const totalWidth = config.layout.MAX_BUBBLE_W_PX;
    
    return {
      width: totalWidth,
      height: totalHeight,
      lineCount: itemCount // Equivalent to text line count for reading time calculation
    };
  }

  /**
   * Build the complete animation timeline 
   * @param {Object} dynamicData - Data for placeholder replacement
   * @returns {Object} - Timeline data with items and metadata
   */
  buildTimeline(dynamicData) {
    const timelineItems = [];
    let currentTime = 0;
    let currentY = 20; // Start with a top margin
    let previousSender = null;
    let totalTypingTime = 0;
    
    // First pass: Create all message objects and calculate dimensions
    const processedMessages = [];
    
    for (const message of this.chatData) {
      const { sender, reaction, contentType = "text" } = message;
      
      let text = null;
      let dimensions = null;
      let typingTime = 0;
      let chartData = null;
      
      if (contentType === "chart" && message.chartData) {
        // Process chart message
        chartData = message.chartData;
        dimensions = this._calculateChartDimensions(chartData);
        
        // For chart messages, calculate typing time based on complexity
        const itemCount = chartData.items?.length || 0;
        typingTime = Math.min(
          config.layout.TYPING_MAX_MS,
          Math.max(config.layout.TYPING_MIN_MS, itemCount * 400) // 400ms per chart item
        );
      } else {
        // Process text message
        text = message.text.replace(/\{(\w+)\}/g, (_, key) => 
          dynamicData[key] !== undefined ? dynamicData[key] : `{${key}}`
        );
        
        // Calculate dimensions using TextProcessor
        dimensions = TextProcessor.wrapText(text);
        
        // Calculate typing time
        typingTime = this.calculateTypingTime(text);
      }
      
      totalTypingTime += typingTime;
      
      // Store processed message
      processedMessages.push({
        sender,
        text,
        dimensions,
        typingTime,
        reaction,
        contentType,
        chartData
      });
    }
    
    // Second pass: Create timeline items with correct positioning and timing
    for (let i = 0; i < processedMessages.length; i++) {
      const { 
        sender, text, dimensions, typingTime, reaction, contentType, chartData 
      } = processedMessages[i];
      
      // Add "reading time" for the previous message (if any)
      if (i > 0) {
        const prevMessage = processedMessages[i-1];
        // Base reading time on line count for both text and chart messages
        const lineCount = prevMessage.dimensions.lineCount;
        const readingTime = Math.max(
          config.layout.TIMING.MIN_READING_TIME_MS,
          lineCount * config.layout.TIMING.MS_PER_WORD * 4 // Approximate 4 words per line
        );
        currentTime += readingTime;
      }
      
      // Add sender transition delay (different timing based on whether sender changes)
      const senderTransitionDelay = this.calculateSenderTransitionDelay(sender, previousSender);
      currentTime += senderTransitionDelay;
      
      // Add typing indicator
      timelineItems.push(new TypingIndicator(
        sender,
        currentTime,
        currentY,
        typingTime
      ));
      
      // Advance time by typing duration
      currentTime += typingTime;
      
      // Add message (appears after typing)
      timelineItems.push(new ChatMessage(
        sender,
        currentTime,
        currentY,
        text,
        dimensions,
        reaction,
        contentType,
        chartData
      ));
      
      // Update Y position for next message based on this message's height
      // Add extra spacing to separate messages visually
      currentY += dimensions.height + config.layout.TIMING.MESSAGE_VERTICAL_SPACING; 
      
      // Remember sender for next message
      previousSender = sender;
    }
    
    // Calculate scroll distance when messages exceed visible area
    const totalContentHeight = currentY + config.layout.TIMING.BOTTOM_MARGIN;
    const viewportHeight = config.layout.VISIBLE_MESSAGES * (config.layout.LINE_HEIGHT_PX * 2 + config.layout.BUBBLE_PAD_Y_PX * 2);
    const scrollDistance = Math.max(0, totalContentHeight - viewportHeight);
    
    return { 
      items: timelineItems,
      scrollDistance,
      totalDuration: currentTime + config.layout.TIMING.ANIMATION_END_BUFFER_MS,
      totalTypingTime: totalTypingTime
    };
  }
}

export default new TimelineBuilder();