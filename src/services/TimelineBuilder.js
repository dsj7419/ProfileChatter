// src/services/TimelineBuilder.js
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TypingIndicator, ChatMessage } from '../models/TimelineItem.js';
import TimingProfile from '../models/TimingProfile.js';
import { config } from '../config/config.js';
import TextProcessor from '../utils/TextProcessor.js';
import ChartRenderer from '../rendering/components/ChartRenderer.js';

class TimelineBuilder {
  /**
   * Constructor - accepts custom chat data
   * @param {Array|null} customChatData - Optional custom chat data to use instead of file
   */
  constructor(customChatData = null) {
    try {
      if (customChatData && Array.isArray(customChatData)) {
        console.log(`Using custom chat data (${customChatData.length} messages)`);
        this.chatData = customChatData;
      } else {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const chatDataPath = join(__dirname, '../../data/chatData.json');
        console.log('Loading chat data from file:', chatDataPath);
        this.chatData = JSON.parse(readFileSync(chatDataPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      this.chatData = [
        { id: "error-1", sender: "me", text: "Error loading chat data. Please check your configuration." }
      ];
    }
  }
  
  calculateTypingTime(text) {
    return Math.min(
      config.layout.TYPING_MAX_MS,
      Math.max(config.layout.TYPING_MIN_MS, text.length * config.layout.TYPING_CHAR_MS)
    );
  }
  
  calculateReadingTime(contentType, dimensions) {
    const multiplier = contentType === 'chart' ? 2.5 : 4;
    const lineCount = dimensions.lineCount || 1;
    const complexityFactor = contentType === 'chart' 
      ? Math.max(1, dimensions.height / 100) 
      : 1;
    
    const readingTime = Math.max(
      config.layout.TIMING.MIN_READING_TIME_MS,
      lineCount * config.layout.TIMING.MS_PER_WORD * multiplier * complexityFactor
    );
    
    return readingTime + (Math.random() * config.layout.TIMING.READING_RANDOMNESS_MS);
  }
  
  calculateSenderTransitionDelay(currentSender, previousSender) {
    if (!previousSender || currentSender === previousSender) {
      return config.layout.TIMING.SAME_SENDER_DELAY_MS;
    }
    return config.layout.TIMING.SENDER_CHANGE_DELAY_MS;
  }

  calculateAvailableBubbleWidth() {
    let maxWidth = config.layout.MAX_BUBBLE_W_PX;
    if (config.avatars && config.avatars.enabled) {
      maxWidth -= (config.avatars.sizePx + (config.avatars.xOffsetPx * 2));
    }
    return maxWidth;
  }

  _calculateChartDimensions(chartDataFormatted) {
    const themeStyles = config.themes[config.activeTheme] || config.themes.ios;
    const availableBubbleWidth = this.calculateAvailableBubbleWidth();
    
    return ChartRenderer.calculateDimensions(chartDataFormatted, themeStyles, availableBubbleWidth);
  }

  buildTimeline(dynamicData) {
    const timelineItems = [];
    const perMessageTimings = [];
    const scrollKeyframeData = [];

    let currentTime = 0;
    let currentY = 10;
    let previousSender = null;
    
    const processedMessages = [];
    const availableBubbleWidth = this.calculateAvailableBubbleWidth();
    
    // First pass — measure / wrap / get typing cost
    for (const message of this.chatData) {
      const { sender, reaction, contentType = "text" } = message;
      
      let text = null;
      let dimensions = null;
      let typingTime = 0;
      let chartDataFormatted = null;
      
      if (contentType === "chart" && message.chartData) {
        chartDataFormatted = JSON.parse(JSON.stringify(message.chartData));
        
        if (chartDataFormatted.items === '{wakatime_chart_data}' && dynamicData.wakatime_chart_data) {
          chartDataFormatted.items = dynamicData.wakatime_chart_data;
        }

        if (!Array.isArray(chartDataFormatted.items)) {
          chartDataFormatted.items = [];
        }
        
        if (typeof chartDataFormatted.title === 'string') {
          chartDataFormatted.title = chartDataFormatted.title.replace(/\{(\w+)\}/g, (_, k) =>
            dynamicData[k] !== undefined ? dynamicData[k] : `{${k}}`);
        }
        
        dimensions = this._calculateChartDimensions(chartDataFormatted);
        const itemCount = chartDataFormatted.items?.length || 0;
        
        const chartComplexity = Math.max(1, dimensions.height / 100);
        typingTime = Math.min(
          config.layout.TYPING_MAX_MS,
          Math.max(config.layout.TYPING_MIN_MS, itemCount * 400 * chartComplexity)
        );
      } else {
        text = message.text.replace(/\{(\w+)\}/g, (_, key) => 
          dynamicData[key] !== undefined ? dynamicData[key] : `{${key}}`
        );
        dimensions = TextProcessor.wrapText(text, availableBubbleWidth);
        typingTime = this.calculateTypingTime(text);
      }
      
      processedMessages.push({
        sender, text, dimensions, typingTime, reaction, contentType, chartData: chartDataFormatted
      });
    }
    
    // Second pass — position items and build timing profile
    for (let i = 0; i < processedMessages.length; i++) {
      const { 
        sender, text, dimensions, typingTime, reaction, contentType, chartData 
      } = processedMessages[i];
      
      // Reading pause for previous message
      let readingTimeMs = 0;
      if (i > 0) {
        const prevMessage = processedMessages[i-1];
        readingTimeMs = this.calculateReadingTime(
          prevMessage.contentType, 
          prevMessage.dimensions
        );
        currentTime += readingTimeMs;
      }
      
      // Calculate delay based on sender change
      const senderDelayMs = this.calculateSenderTransitionDelay(sender, previousSender);
      currentTime += senderDelayMs;
      
      // Add typing indicator to timeline
      timelineItems.push(new TypingIndicator(sender, currentTime, currentY, typingTime));
      currentTime += typingTime;
      
      // Add message bubble to timeline
      timelineItems.push(new ChatMessage(
        sender, currentTime, currentY, text, dimensions, reaction, contentType, chartData
      ));
      
      // Track scroll keyframe data for each message with special handling for charts
      if (timelineItems[timelineItems.length - 1] instanceof ChatMessage) {
        scrollKeyframeData.push({
          y: currentY,
          startTime: currentTime
        });
        
        if (contentType === 'chart') {
          scrollKeyframeData.push({
            y: currentY + 60,
            startTime: currentTime + 300
          });
        }
      }
      
      // Track per-message timings
      perMessageTimings.push({ 
        typingMs: typingTime, 
        readingMs: readingTimeMs,
        senderDelayMs: senderDelayMs
      });
      
      // Update Y position for next message
      let bubbleDisplayHeight = dimensions.height;
      if (contentType === 'chart') {
        bubbleDisplayHeight += config.layout.BUBBLE_PAD_Y_PX * 2;
      }

      currentY += bubbleDisplayHeight + config.layout.TIMING.MESSAGE_VERTICAL_SPACING; 
      previousSender = sender;
    }
    
    // Calculate final scroll metrics
    const totalContentHeight = currentY + config.layout.TIMING.BOTTOM_MARGIN;
    const viewportHeight = config.layout.CHAT_HEIGHT_PX; 
    const scrollDistance = Math.max(0, totalContentHeight - viewportHeight);
    
    // Get scroll speed multiplier from dynamicData or config
    const scrollSpeedMultiplier = (dynamicData.layoutAnimationOverrides && 
      typeof dynamicData.layoutAnimationOverrides.SCROLL_SPEED_MULTIPLIER === 'number')
      ? dynamicData.layoutAnimationOverrides.SCROLL_SPEED_MULTIPLIER
      : config.layout.ANIMATION.SCROLL_SPEED_MULTIPLIER || 1.0;
    
    // Calculate adaptive scrolling speed based on content complexity
    let scrollPixelsPerSec = config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC;
    
    // Count chart messages and their complexity
    const chartMessages = processedMessages.filter(msg => msg.contentType === 'chart');
    const chartCount = chartMessages.length;
    
    if (chartCount > 0) {
      const totalChartComplexity = chartMessages.reduce((sum, msg) => {
        const itemCount = msg.chartData?.items?.length || 0;
        const heightFactor = msg.dimensions.height / 100;
        return sum + (itemCount * heightFactor);
      }, 0);
      
      const avgComplexity = totalChartComplexity / chartCount;
      
      const speedupFactor = Math.min(2.0, 1 + (chartCount * 0.1) + (avgComplexity * 0.05));
      scrollPixelsPerSec *= speedupFactor;
    }
    
    // Apply the multiplier to the scrolling speed
    const effectivePixelsPerSec = scrollPixelsPerSec * scrollSpeedMultiplier * 0.5;
    
    // Calculate scroll duration with adaptive speed and multiplier
    const scrollDurationSec = scrollDistance > 0 
      ? Math.max(config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC, scrollDistance / effectivePixelsPerSec)
      : 0;
    
    // Calculate messaging time for correct keyframe percentages
    const totalMessagingTimeMs = perMessageTimings.reduce(
      (sum, t) => sum + t.typingMs + t.readingMs + t.senderDelayMs, 0
    );
    
    // Build comprehensive timing profile
    const timingProfile = new TimingProfile(
      effectivePixelsPerSec, 
      scrollDurationSec, 
      scrollDistance,
      perMessageTimings
    );

    return { 
      items: timelineItems,
      timings: timingProfile,
      totalDuration: timingProfile.getTotalDuration(config.layout.TIMING.ANIMATION_END_BUFFER_MS),
      totalTypingTime: timingProfile.getTotalTypingTime(),
      scrollKeyframeData: scrollKeyframeData,
      totalMessagingTimeSec: totalMessagingTimeMs / 1000
    };
  }
}

export default TimelineBuilder;