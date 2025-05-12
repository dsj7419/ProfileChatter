<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import 'emoji-picker-element';
  
    // Props
    export let targetElement = null; // Element to position picker near
    
    // Internal state
    let picker;
    let pickerElement;
    let isVisible = false;
    let position = { top: 0, left: 0 };
    const dispatch = createEventDispatcher();
  
    // Initialize picker on mount
    onMount(() => {
      // Handle clicks outside the picker to close it
      document.addEventListener('click', handleOutsideClick);
      
      // Initialize picker when this component is mounted
      if (pickerElement) {
        // Listen for emoji selection
        pickerElement.addEventListener('emoji-click', event => {
          // Get the selected emoji and dispatch to parent
          const emoji = event.detail.unicode;
          dispatch('select', emoji);
          hide();
        });
      }
    });
  
    onDestroy(() => {
      document.removeEventListener('click', handleOutsideClick);
    });
  
    // Show the emoji picker near the target element
    export function show() {
      if (!targetElement) return;
      
      isVisible = true;
      
      // Calculate position after the component has been rendered
      setTimeout(() => {
        if (!pickerElement) return;
        positionPickerNearTarget();
      }, 0);
    }
  
    // Hide the emoji picker
    export function hide() {
      isVisible = false;
    }
    
    // Toggle visibility
    export function toggle() {
      if (isVisible) {
        hide();
      } else {
        show();
      }
    }
  
    // Handle click outside the picker
    function handleOutsideClick(event) {
      // Ignore clicks on the target element (since that's handled by the toggle)
      if (targetElement && targetElement.contains(event.target)) {
        return;
      }
      
      // Close if click is outside the picker
      if (pickerElement && !pickerElement.contains(event.target) && isVisible) {
        hide();
      }
    }
  
    // Position picker near the target element
    function positionPickerNearTarget() {
      if (!targetElement || !pickerElement) return;
      
      const targetRect = targetElement.getBoundingClientRect();
      const pickerRect = pickerElement.getBoundingClientRect();
      
      // Default: Position above the target
      let top = targetRect.top - pickerRect.height - 10;
      let left = targetRect.left;
      
      // If there's not enough room above, position below
      if (top < 10) {
        top = targetRect.bottom + 10;
      }
      
      // Adjust horizontal positioning to ensure it's on screen
      const rightEdge = left + pickerRect.width;
      if (rightEdge > window.innerWidth - 10) {
        left = Math.max(10, window.innerWidth - pickerRect.width - 10);
      }
      
      // Update position
      position = { top, left };
    }
    
    // Handle clear button click
    function handleClear() {
      dispatch('clear');
      hide();
    }
  </script>
  
  <div 
    class="emoji-picker-container"
    class:visible={isVisible} 
    bind:this={pickerElement}
    style="top: {position.top}px; left: {position.left}px;"
  >
    <emoji-picker></emoji-picker>
    
    <div class="picker-footer">
      <button 
        type="button" 
        class="clear-button"
        on:click={handleClear}
      >
        ❌ Clear Reaction
      </button>
    </div>
  </div>
  
  <style>
    .emoji-picker-container {
      position: fixed;
      z-index: 1000;
      display: none;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .emoji-picker-container.visible {
      display: flex;
    }
    
    .picker-footer {
      padding: 8px;
      display: flex;
      justify-content: center;
      border-top: 1px solid #eee;
    }
    
    .clear-button {
      font-size: 14px;
      padding: 6px 12px;
      background-color: #f7f7f7;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .clear-button:hover {
      background-color: #f0f0f0;
      border-color: #ccc;
    }
    
    :global(emoji-picker) {
      --emoji-size: 1.5rem;
      --background: white;
      --border-color: #eaeaea;
      --category-emoji-size: 1.25rem;
      height: 350px;
      width: 325px;
    }
  </style>