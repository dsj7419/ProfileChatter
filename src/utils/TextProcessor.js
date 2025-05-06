/**
 * TextProcessor.js
 * Handles text processing operations like wrapping and escaping
 * Single Responsibility: Text processing utilities
 */
import { MAX_BUBBLE_W_PX, MIN_BUBBLE_W_PX, FONT_SIZE_PX, BUBBLE_PAD_X_PX, BUBBLE_PAD_Y_PX, LINE_HEIGHT_PX } from '../config/LayoutConstants.js';

class TextProcessor {
  /**
   * Calculate approximate text width (reliable enough for node environment)
   * @param {string} text - Text to measure
   * @returns {number} - Estimated pixel width
   */
  measureTextWidth(text) {
    // Simple heuristic based on average character width
    // Different characters have different widths, so this is an approximation
    // For a more precise measurement, we would need a canvas context
    const avgCharWidth = FONT_SIZE_PX * 0.6; // Rough approximation for proportional fonts
    return text.length * avgCharWidth;
  }
  
  /**
   * Wrap text to fit within chat bubble width constraints
   * @param {string} text - Raw text to wrap
   * @returns {Object} - Wrapped lines and calculated dimensions
   */
  wrapText(text) {
    // Handle multi-line input (e.g., from \n in the text)
    const paragraphs = text.split('\n');
    const allLines = [];
    
    // Process each paragraph 
    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/);
      let currentLine = '';
      
      // Wrap words to fit maximum width
      for (const word of words) {
        // Skip empty words
        if (!word) continue;
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = this.measureTextWidth(testLine);
        
        if (testWidth <= MAX_BUBBLE_W_PX - 2 * BUBBLE_PAD_X_PX) {
          currentLine = testLine;
        } else {
          if (currentLine) allLines.push(currentLine);
          currentLine = word;
        }
      }
      
      // Add final line from paragraph
      if (currentLine) {
        allLines.push(currentLine);
      }
    }
    
    // Ensure we have at least one line
    if (allLines.length === 0) {
      allLines.push('');
    }
    
    // Calculate maximum width needed
    const maxLineWidth = Math.max(
      ...allLines.map(line => this.measureTextWidth(line)),
      MIN_BUBBLE_W_PX - 2 * BUBBLE_PAD_X_PX // Ensure minimum width
    );
    
    // Calculate bubble dimensions
    const width = Math.min(
      maxLineWidth + 2 * BUBBLE_PAD_X_PX,
      MAX_BUBBLE_W_PX
    );
    
    const height = Math.max(
      allLines.length * LINE_HEIGHT_PX + 2 * BUBBLE_PAD_Y_PX,
      2 * BUBBLE_PAD_Y_PX + LINE_HEIGHT_PX // Ensure minimum height
    );
    
    return {
      lines: allLines,
      width,
      height,
      lineCount: allLines.length
    };
  }
  
  /**
   * Escape special XML characters for SVG text
   * @param {string} text - Raw text
   * @returns {string} - XML-safe text
   */
  escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export default new TextProcessor();