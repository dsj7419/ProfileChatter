/**
 * ChartAnimationEngine.js
 * Centralizes chart animation logic for reusability and standardization.
 * Single Responsibility: Generate animation markup for chart elements.
 */

class ChartAnimationEngine {
    /**
     * Generate animation for a donut segment's "drawing" effect using stroke-dashoffset
     * @param {string} segmentId - Optional ID of the segment (for future interactivity)
     * @param {number} arcLength - Length of the arc path to animate
     * @param {number} durationSec - Duration of the animation in seconds
     * @param {number} beginSec - Delay before animation starts in seconds
     * @returns {string} - SVG animation markup for stroke-dashoffset drawing effect
     */
    static getDonutSegmentDrawAnimation(segmentId, arcLength, durationSec, beginSec) {
      // Override duration to be faster (0.5s maximum) if the theme value is too slow
      const actualDuration = Math.min(durationSec, 0.5);
      
      return `
        <animate attributeName="stroke-dashoffset" 
                 from="${arcLength}" to="0" 
                 dur="${actualDuration}s" 
                 begin="${beginSec}s" 
                 calcMode="spline"
                 keySplines="0.215, 0.61, 0.355, 1"
                 fill="freeze" />
        <animate attributeName="opacity" 
                 from="0" to="1" 
                 dur="${actualDuration * 0.5}s" 
                 begin="${beginSec}s" 
                 fill="freeze" />
      `;
    }
  
    /**
     * Generate animation for a bar chart's growth effect
     * @param {number} width - Target width of the bar
     * @param {number} durationSec - Duration of the animation in seconds
     * @param {number} beginSec - Delay before animation starts in seconds
     * @returns {string} - SVG animation markup for width growth effect
     */
    static getBarGrowAnimation(width, durationSec, beginSec) {
      // Keep bar animations consistent but slightly faster
      const actualDuration = Math.min(durationSec, 0.7);
      
      return `
        <animate attributeName="width"
                 from="0" to="${width}" 
                 dur="${actualDuration}s" 
                 begin="${beginSec}s"
                 calcMode="spline"
                 keySplines="0.215, 0.61, 0.355, 1"
                 fill="freeze" />
        <animate attributeName="opacity"
                 from="0.2" to="1"
                 dur="${actualDuration}s"
                 begin="${beginSec}s"
                 fill="freeze" />
      `;
    }
  }
  
  export default ChartAnimationEngine;