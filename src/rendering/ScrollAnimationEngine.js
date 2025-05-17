/**
 * ScrollAnimationEngine.js
 * Responsible for generating dynamic scroll animation keyframes
 * Single Responsibility: Create CSS keyframes for natural chat scrolling
 */

export default class ScrollAnimationEngine {
  /**
   * Generate dynamic keyframes CSS for scrolling animation
   * @param {Array<{y: number, startTime: number}>} scrollSteps - Y positions and appearance times
   * @param {number} totalDurationSec - Total animation duration in seconds
   * @param {string} animationName - Name for the keyframes rule (default: 'scrollUp')
   * @returns {string} - Complete CSS keyframes rule
   */
  static generateScrollKeyframesCSS(scrollSteps, totalDurationSec, animationName = 'scrollUp') {
    if (!scrollSteps || !scrollSteps.length) {
      // Fallback for empty data
      return `@keyframes ${animationName}{0%{transform:translateY(0)}100%{transform:translateY(0)}}`;
    }

    // Always start with initial keyframe at 0%
    const keyframes = [`0% { transform: translateY(0px); }`];
    
    // Generate keyframes for each step
    for (let i = 0; i < scrollSteps.length; i++) {
      const step = scrollSteps[i];
      const nextStep = scrollSteps[i + 1] || null;
      
      // Calculate percentage based on startTime relative to total duration
      const percent = Math.round((step.startTime / (totalDurationSec * 1000)) * 100);
      
      // Calculate translateY value (negative for upward scroll)
      const translateYValue = Math.min(0, -step.y);
      
      // Add keyframe for this step
      keyframes.push(`${percent}% { transform: translateY(${translateYValue}px); }`);
      
      // Add intermediate keyframes between this step and the next step for smoother transitions
      if (nextStep) {
        const nextPercent = Math.round((nextStep.startTime / (totalDurationSec * 1000)) * 100);
        const nextTranslateY = Math.min(0, -nextStep.y);
        
        // Only add intermediate frames if there's enough gap between percentages (>3%)
        // and if there's actual movement (different Y values)
        if ((nextPercent - percent > 3) && (translateYValue !== nextTranslateY)) {
          // Add 2 intermediate keyframes at 1/3 and 2/3 of the gap
          const midPercent1 = Math.round(percent + (nextPercent - percent) / 3);
          const midPercent2 = Math.round(percent + (nextPercent - percent) * 2 / 3);
          
          // Calculate intermediate positions with gentler easing for more glide
          const midTranslateY1 = translateYValue + (nextTranslateY - translateYValue) * 0.4;
          const midTranslateY2 = translateYValue + (nextTranslateY - translateYValue) * 0.7;
          
          keyframes.push(`${midPercent1}% { transform: translateY(${midTranslateY1}px); }`);
          keyframes.push(`${midPercent2}% { transform: translateY(${midTranslateY2}px); }`);
        }
      }
    }
    
    // Get the absolute final position needed to show the last message at the bottom
    const lastStep = scrollSteps[scrollSteps.length - 1];
    const lastPercent = Math.round((lastStep.startTime / (totalDurationSec * 1000)) * 100);
    
    // Calculate the final translateY directly - this is the maximum scroll position we'll ever reach
    const finalTranslateY = -Math.max(0, lastStep.y - 300); // Show last message with 300px space from top
    
    // Ensure all keyframes respect this maximum scroll - check and fix any overshooting
    for (let i = 0; i < keyframes.length; i++) {
      const match = keyframes[i].match(/translateY\(([-\d.]+)px\)/);
      if (match) {
        const currentY = parseFloat(match[1]);
        // If any keyframe scrolls too far up (more negative than final position), cap it
        if (currentY < finalTranslateY) {
          keyframes[i] = keyframes[i].replace(/translateY\(([-\d.]+)px\)/, `translateY(${finalTranslateY}px)`);
        }
      }
    }
    
    // Add a simple final keyframe at 100% if needed
    if (lastPercent < 100) {
      keyframes.push(`100% { transform: translateY(${finalTranslateY}px); }`);
    }
    
    // Combine into complete keyframes rule
    return `@keyframes ${animationName} { ${keyframes.join(' ')} }`;
  }
}