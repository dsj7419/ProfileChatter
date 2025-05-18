<script>
    import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
    
    // Props
    export let placeholders = []; // Array of placeholder objects
    export let filterText = ''; // Text to filter by (what user typed after '{')
    export let targetElement = null; // DOM element that triggered the selector
    export let isVisible = false; // Controls visibility
    
    // Event dispatcher for the component
    const dispatch = createEventDispatcher();
    
    // State
    let selectedIndex = 0; // Index of currently selected placeholder for keyboard navigation
    let containerElement; // Reference to the container element for positioning
    let filteredPlaceholdersList = []; // Flattened list of filtered placeholders for keyboard navigation
    
    // Group placeholders by category
    $: categorizedPlaceholders = placeholders.reduce((acc, placeholder) => {
      if (!acc[placeholder.category]) {
        acc[placeholder.category] = [];
      }
      acc[placeholder.category].push(placeholder);
      return acc;
    }, {});
    
    // Filter categorized placeholders by filterText
    $: filteredCategorizedPlaceholders = filterPlaceholders(categorizedPlaceholders, filterText);
    
    // Update flattened list for keyboard navigation
    $: {
      filteredPlaceholdersList = [];
      Object.values(filteredCategorizedPlaceholders).forEach(categoryPlaceholders => {
        filteredPlaceholdersList = [...filteredPlaceholdersList, ...categoryPlaceholders];
      });
      // Reset selectedIndex if it's out of bounds
      if (selectedIndex >= filteredPlaceholdersList.length) {
        selectedIndex = Math.max(0, filteredPlaceholdersList.length - 1);
      }
      if (filteredPlaceholdersList.length === 0) {
        selectedIndex = -1;
      }
    }
    
    /**
     * Filter placeholders by search text
     * @param {Object} categorized - Categorized placeholders
     * @param {string} searchText - Text to filter by
     * @returns {Object} Filtered categorized placeholders
     */
    function filterPlaceholders(categorized, searchText) {
      if (!searchText) return categorized;
      
      const result = {};
      const lowerSearchText = searchText.toLowerCase();
      
      Object.entries(categorized).forEach(([category, items]) => {
        const filtered = items.filter(item => {
          return (
            item.label.toLowerCase().includes(lowerSearchText) ||
            item.value.toLowerCase().includes(lowerSearchText) ||
            item.description.toLowerCase().includes(lowerSearchText)
          );
        });
        
        if (filtered.length > 0) {
          result[category] = filtered;
        }
      });
      
      return result;
    }
    
    /**
     * Handle selection of a placeholder
     * @param {Object} placeholder - The selected placeholder
     */
    function handleSelect(placeholder) {
      dispatch('select', placeholder.value);
      dispatch('close');
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeydown(event) {
      if (!isVisible) return;
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          selectedIndex = (selectedIndex + 1) % filteredPlaceholdersList.length;
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          selectedIndex = selectedIndex <= 0 
            ? filteredPlaceholdersList.length - 1 
            : selectedIndex - 1;
          break;
          
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredPlaceholdersList.length) {
            handleSelect(filteredPlaceholdersList[selectedIndex]);
          }
          break;
          
        case 'Escape':
          event.preventDefault();
          dispatch('close');
          break;
      }
    }
    
    /**
     * Position the selector relative to the target element
     */
    function positionSelector() {
      if (!targetElement || !containerElement || !isVisible) return;
      
      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      
      // Position below the text cursor
      const cursorOffset = 20; // Approximate height of a line of text
      let top = targetRect.top + cursorOffset;
      
      // Make sure it doesn't go off-screen
      const viewportHeight = window.innerHeight;
      if (top + containerRect.height > viewportHeight) {
        // Position above instead
        top = targetRect.top - containerRect.height;
      }
      
      // Position horizontally
      let left = targetRect.left;
      
      // Make sure it doesn't go off the right edge
      const viewportWidth = window.innerWidth;
      if (left + containerRect.width > viewportWidth) {
        left = viewportWidth - containerRect.width - 10;
      }
      
      containerElement.style.top = `${top}px`;
      containerElement.style.left = `${left}px`;
    }
    
    // Lifecycle hooks
    onMount(() => {
      window.addEventListener('keydown', handleKeydown);
      return () => {
        window.removeEventListener('keydown', handleKeydown);
      };
    });
    
    afterUpdate(() => {
      positionSelector();
    });
  </script>
  
  <!-- The component is only rendered when visible -->
  {#if isVisible}
    <div 
      bind:this={containerElement}
      class="fixed z-50 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200 w-64 max-h-72 overflow-y-auto"
      on:keydown={handleKeydown}
      role="listbox"
      aria-label="Placeholder options"
      tabindex="0"
    >
      <!-- If there are no matching placeholders, show a message -->
      {#if Object.keys(filteredCategorizedPlaceholders).length === 0}
        <div class="p-3 text-sm text-gray-500">
          No matching placeholders found
        </div>
      {:else}
        <!-- Loop through categories -->
        {#each Object.entries(filteredCategorizedPlaceholders) as [category, categoryPlaceholders]}
          <div class="placeholder-category">
            <!-- Category header -->
            <div class="text-xs font-semibold text-gray-500 uppercase px-3 py-2 bg-gray-50 sticky top-0">
              {category}
            </div>
            
            <!-- Placeholder items in this category -->
            <div class="placeholder-items">
              {#each categoryPlaceholders as placeholder}
                {@const isSelected = filteredPlaceholdersList.indexOf(placeholder) === selectedIndex}
                <div 
                  class="placeholder-item px-3 py-2 cursor-pointer hover:bg-blue-50 {isSelected ? 'bg-blue-100' : ''}"
                  on:click={() => handleSelect(placeholder)}
                  on:keydown={(e) => e.key === 'Enter' && handleSelect(placeholder)}
                  role="option"
                  aria-selected={isSelected}
                  tabindex="0"
                >
                  <!-- Label -->
                  <div class="text-sm font-medium text-gray-800">
                    {placeholder.label}
                  </div>
                  
                  <!-- Value in monospace font -->
                  <div class="text-xs text-gray-600 font-mono">
                    {placeholder.value}
                  </div>
                  
                  <!-- Description (smaller text) -->
                  <div class="text-xs text-gray-500 mt-1">
                    {placeholder.description}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
  
  <style>
    /* Add any additional styles not covered by Tailwind */
    .placeholder-item:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
    
    /* Ensure smooth scrolling */
    .placeholder-category {
      scroll-behavior: smooth;
    }
  </style>