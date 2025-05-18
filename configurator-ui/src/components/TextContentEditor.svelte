<script>
    import { onMount, onDestroy } from 'svelte';
    import { placeholderData } from '../stores/configStore.js';
    import PlaceholderSelector from './PlaceholderSelector.svelte';
    
    // Props
    export let text = "";
    export let updateStore;
    
    // Component state
    let showPlaceholderSelector = false;
    let placeholderFilter = '';
    let textareaElement;
    let placeholderStartIndex = -1;
    
    /**
     * Handle textarea auto-resize
     * @param {Event} event - Input event from textarea
     */
    function autoResize(event) {
      const textarea = event.target;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content
      textarea.style.height = `${textarea.scrollHeight}px`;
      
      // Notify store of changes
      updateStore();
    }
    
    /**
     * Handle input in the textarea, detecting '{' and subsequent text
     * @param {Event} event - Input event from textarea
     */
    function handleInput(event) {
      // First handle auto-resize
      autoResize(event);
      
      // Get cursor position
      const cursorPos = textareaElement.selectionStart;
      
      // Check if placeholder selector should be shown
      if (text[cursorPos - 1] === '{' && !showPlaceholderSelector) {
        // Show the placeholder selector
        showPlaceholderSelector = true;
        placeholderStartIndex = cursorPos - 1;
        placeholderFilter = '';
      } 
      // If selector is visible, check if we should update the filter
      else if (showPlaceholderSelector) {
        // Check if the user has closed the placeholder with '}'
        if (text[cursorPos - 1] === '}') {
          hidePlaceholderSelector();
          return;
        }
        
        // Check if the user has typed a space
        if (text[cursorPos - 1] === ' ') {
          hidePlaceholderSelector();
          return;
        }
        
        // Check if the user has backspaced past the '{'
        if (cursorPos <= placeholderStartIndex) {
          hidePlaceholderSelector();
          return;
        }
        
        // Check if cursor has moved away from placeholder context
        if (cursorPos < text.length && text.substring(placeholderStartIndex, cursorPos).indexOf('}') !== -1) {
          hidePlaceholderSelector();
          return;
        }
        
        // Update filter text (everything between '{' and current cursor)
        placeholderFilter = text.substring(placeholderStartIndex + 1, cursorPos);
      }
    }
    
    /**
     * Hide the placeholder selector and reset related state
     */
    function hidePlaceholderSelector() {
      showPlaceholderSelector = false;
      placeholderFilter = '';
      placeholderStartIndex = -1;
    }
    
    /**
     * Handle placeholder selection
     * @param {CustomEvent} event - Event with selected placeholder value
     */
    function handlePlaceholderSelect(event) {
      if (placeholderStartIndex === -1) return;
      
      const placeholderValue = event.detail;
      const cursorPos = textareaElement.selectionStart;
      
      // Replace the '{' and any filter text with the selected placeholder
      const newText = text.substring(0, placeholderStartIndex) + 
                     placeholderValue + 
                     text.substring(cursorPos);
      
      // Update the text
      text = newText;
      
      // Position cursor after the inserted placeholder
      setTimeout(() => {
        const newCursorPos = placeholderStartIndex + placeholderValue.length;
        textareaElement.focus();
        textareaElement.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
      
      // Hide the placeholder selector
      hidePlaceholderSelector();
      
      // Notify store of changes
      updateStore();
    }
    
    /**
     * Handle click outside to close the placeholder selector
     * @param {MouseEvent} event - Click event
     */
    function handleClickOutside(event) {
      if (!showPlaceholderSelector) return;
      
      // Check if the click was outside both the textarea and the selector
      const selectorElement = document.querySelector('.placeholder-selector');
      if (
        !textareaElement.contains(event.target) && 
        (!selectorElement || !selectorElement.contains(event.target))
      ) {
        hidePlaceholderSelector();
      }
    }
    
    // Add click outside listener
    onMount(() => {
      document.addEventListener('click', handleClickOutside);
    });
    
    onDestroy(() => {
      document.removeEventListener('click', handleClickOutside);
    });
</script>

<div class="relative">
  <textarea 
    bind:value={text} 
    bind:this={textareaElement}
    on:input={handleInput}
    class="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] resize-none transition-colors duration-200"
    placeholder="Enter message text..."
    rows={Math.max(3, (text?.match(/\n/g) || []).length + 1)}
  ></textarea>
  <div class="absolute top-1 right-2">
    <span class="text-xs text-gray-400 bg-gray-50 px-1">Edit</span>
  </div>
  
  <!-- Placeholder Selector -->
  <PlaceholderSelector
    placeholders={$placeholderData}
    filterText={placeholderFilter}
    targetElement={textareaElement}
    isVisible={showPlaceholderSelector}
    on:select={handlePlaceholderSelect}
    on:close={hidePlaceholderSelector}
    class="placeholder-selector"
  />
</div>

<style>
  /* Custom styling for textarea autoresize */
  textarea {
    overflow-y: hidden;
  }
</style>