// src/services/TimelineBuilder.js
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TypingIndicator, ChatMessage } from '../models/TimelineItem.js';
import { config } from '../config/config.js';
import TextProcessor from '../utils/TextProcessor.js';

class TimelineBuilder {
  constructor() {
    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const chatDataPath = join(__dirname, '../../data/chatData.json');
      this.chatData = JSON.parse(readFileSync(chatDataPath, 'utf8'));
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
  
  calculateReadingTime(text) {
    const wordCount = text.split(/\s+/).length;
    const baseReadingTime = config.layout.TIMING.MIN_READING_TIME_MS;
    const readingTime = Math.max(
      baseReadingTime, 
      wordCount * config.layout.TIMING.MS_PER_WORD
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

  _calculateChartDimensions(chartData) {
    const themeStyles = config.themes[config.activeTheme] || config.themes.ios;
    const cs = themeStyles.CHART_STYLES;

    let calculatedContentHeight = 0;

    // Top padding for the chart content area
    calculatedContentHeight += cs.CHART_PADDING_Y_PX;

    // Title section height
    if (chartData.title) {
        const contentAreaWidth = this.calculateAvailableBubbleWidth(); // Max width for bubble content
        const barTrackW = contentAreaWidth - (cs.CHART_PADDING_X_PX * 2);
        const titleMaxTextWidth = barTrackW; 
        
        const wrappedTitle = TextProcessor.wrapText(TextProcessor.escapeXML(chartData.title), titleMaxTextWidth);
        const titleLineHeight = cs.TITLE_FONT_SIZE_PX * (cs.TITLE_LINE_HEIGHT_MULTIPLIER ?? 1.2);
        
        // Height of the actual text block for the title
        const titleTextActualHeight = (wrappedTitle.lines.length * titleLineHeight) - (titleLineHeight - cs.TITLE_FONT_SIZE_PX) ;
        calculatedContentHeight += titleTextActualHeight;
        calculatedContentHeight += (cs.TITLE_BOTTOM_MARGIN_PX ?? 10); // Margin after title
    }
    
    const itemCount = chartData.items?.length || 0;
    if (itemCount > 0) {
        const labelHeight = cs.LABEL_FONT_SIZE_PX; 
        // Assuming a small gap from label baseline to top of bar, then bar height
        // This part matches the iteration logic in ChartRenderer more closely.
        // Each item takes: label height + gap + bar height + gap to next item.
        // The gapLabelToBar is implicit in how cursorY moves in ChartRenderer.
        // Here, we sum explicit components.
        
        chartData.items.forEach((item, index) => {
            calculatedContentHeight += labelHeight; // Label text height
            // Add height for the bar itself and the gap below it.
            // The gap between label and bar is small and part of the bar's conceptual row.
            calculatedContentHeight += cs.BAR_HEIGHT_PX; 
            if (index < itemCount - 1) {
                calculatedContentHeight += cs.BAR_SPACING_PX;
            }
        });
        // Add a bit more to account for the small gap between label and bar for each item
        // This is an approximation. A more precise way would be to sum up exact cursorY movements from ChartRenderer.
        calculatedContentHeight += itemCount * 2; // Approx 2px gap for each label-to-bar transition
    }

    // Bottom padding for the chart content area
    calculatedContentHeight += cs.CHART_PADDING_Y_PX;
    
    const availableBubbleW = this.calculateAvailableBubbleWidth();
    
    return {
      width: availableBubbleW, // This is the inner content width the chart can use
      height: calculatedContentHeight, // This is the height of the chart's drawing area
      lineCount: itemCount 
    };
  }

  buildTimeline(dynamicData) {
    const timelineItems = [];
    let currentTime = 0;
    let currentY = 20; 
    let previousSender = null;
    let totalTypingTime = 0;
    
    const processedMessages = [];
    const availableBubbleWidth = this.calculateAvailableBubbleWidth();
    
    for (const message of this.chatData) {
      const { sender, reaction, contentType = "text" } = message;
      let text = null;
      let dimensions = null;
      let typingTime = 0;
      let chartDataForMessage = null;
      
      if (contentType === "chart" && message.chartData) {
        chartDataForMessage = message.chartData;
        dimensions = this._calculateChartDimensions(chartDataForMessage);
        const itemCount = chartDataForMessage.items?.length || 0;
        typingTime = Math.min(
          config.layout.TYPING_MAX_MS,
          Math.max(config.layout.TYPING_MIN_MS, itemCount * 400) 
        );
      } else {
        text = message.text.replace(/\{(\w+)\}/g, (_, key) => 
          dynamicData[key] !== undefined ? dynamicData[key] : `{${key}}`
        );
        dimensions = TextProcessor.wrapText(text, availableBubbleWidth);
        typingTime = this.calculateTypingTime(text);
      }
      totalTypingTime += typingTime;
      processedMessages.push({
        sender, text, dimensions, typingTime, reaction, contentType, chartData: chartDataForMessage
      });
    }
    
    for (let i = 0; i < processedMessages.length; i++) {
      const { 
        sender, text, dimensions, typingTime, reaction, contentType, chartData 
      } = processedMessages[i];
      
      if (i > 0) {
        const prevMessage = processedMessages[i-1];
        const lineCount = prevMessage.dimensions.lineCount; 
        const readingTimeMultiplier = prevMessage.contentType === 'chart' ? 2.5 : 4; 
        const readingTime = Math.max(
          config.layout.TIMING.MIN_READING_TIME_MS,
          lineCount * config.layout.TIMING.MS_PER_WORD * readingTimeMultiplier 
        );
        currentTime += readingTime;
      }
      
      const senderTransitionDelay = this.calculateSenderTransitionDelay(sender, previousSender);
      currentTime += senderTransitionDelay;
      
      timelineItems.push(new TypingIndicator(sender, currentTime, currentY, typingTime));
      currentTime += typingTime;
      
      // SvgRenderer._renderChatBubble adds BUBBLE_PAD_Y_PX * 2 to chart height.
      // So, 'dimensions.height' for charts should be the chart's *internal content* height.
      // 'dimensions.width' for charts is the *internal content* width.
      timelineItems.push(new ChatMessage(
        sender, currentTime, currentY, text, dimensions, reaction, contentType, chartData
      ));
      
      // The 'height' for SvgRenderer's bubble includes its own padding for text messages.
      // For chart messages, SvgRenderer adds its own padding around dimensions.height.
      let bubbleDisplayHeight = dimensions.height;
      if(contentType === 'chart'){
          bubbleDisplayHeight += config.layout.BUBBLE_PAD_Y_PX * 2;
      }

      currentY += bubbleDisplayHeight + config.layout.TIMING.MESSAGE_VERTICAL_SPACING; 
      previousSender = sender;
    }
    
    const totalContentHeight = currentY + config.layout.TIMING.BOTTOM_MARGIN - config.layout.TIMING.MESSAGE_VERTICAL_SPACING; // Adjusted to not double count last spacing
    const viewportHeight = config.layout.CHAT_HEIGHT_PX; 
    const scrollDistance = Math.max(0, totalContentHeight - viewportHeight);
    
    const scrollDurationSec = scrollDistance > 0 ? (scrollDistance / config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC) : 0;

    return { 
      items: timelineItems,
      scrollDistance,
      totalDuration: currentTime + config.layout.TIMING.ANIMATION_END_BUFFER_MS + (scrollDurationSec * 1000),
      totalTypingTime: totalTypingTime
    };
  }
}

export default new TimelineBuilder();