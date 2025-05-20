<script lang="ts">
    /**
     * File: src/lib/ui/HelpIconTooltip.svelte
     * Convenience wrapper that shows a small "i" badge wrapped in Tooltip.
     * Provides a consistent help icon throughout the application UI.
     */
    import Tooltip from './Tooltip.svelte';
    import type { TooltipPosition } from './Tooltip.svelte';
    
    /** The tooltip text to display */
    export let text: string;
    /** The preferred position of the tooltip */
    export let position: TooltipPosition = 'top';
  </script>
  
  <Tooltip {text} {position} openDelay={100} closeDelay={100}>
    <span
      class="ml-1 flex h-4 w-4 items-center justify-center rounded-full
             bg-gray-200 text-[10px] font-bold text-gray-600
             hover:bg-gray-300 hover:text-gray-700
             focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Help"
    >
      i<span class="sr-only">Help</span>
    </span>
  </Tooltip>