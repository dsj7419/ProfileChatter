<script>
  // Props
  export let chartData;
  export let updateStore;
  
  // Function to add a new chart data segment
  function addChartSegment() {
    // Ensure items array exists
    if (!chartData.items) {
      chartData.items = [];
    }
    
    // Generate a unique color based on the items array length (cycling through some nice colors)
    const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5C6BC0', '#26A69A', '#FFA726', '#EC407A'];
    const colorIndex = chartData.items.length % colors.length;
    
    // Create new segment and add to array
    const newSegment = {
      label: `Segment ${chartData.items.length + 1}`,
      value: 10,
      color: colors[colorIndex]
    };
    
    chartData.items.push(newSegment);
    
    // Force store update to ensure reactivity
    updateStore();
  }
  
  // Function to delete a chart data segment
  function deleteChartSegment(segmentIndex) {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      // Remove the segment at the specified index
      chartData.items.splice(segmentIndex, 1);
      
      // Force store update to ensure reactivity
      updateStore();
    }
  }
  
  // Function to update a segment's property
  function updateSegmentProperty(segmentIndex, property, event) {
    let value = event.target.value;
    
    // For value property, convert to number
    if (property === 'value') {
      value = parseInt(value, 10);
      if (isNaN(value)) value = 0;
    }
    
    // Update the property
    chartData.items[segmentIndex][property] = value;
    
    // Force store update to ensure reactivity
    updateStore();
  }
  
  // Function to update center text
  function updateCenterText(event) {
    chartData.centerText = event.target.value;
    updateStore();
  }
  
  // Function for special handling of the dynamic wakatime chart data
  function setWakatimeData() {
    chartData.items = '{wakatime_chart_data}';
    updateStore();
  }
  
  // Function to reset from dynamic data to actual array
  function resetFromDynamicData() {
    chartData.items = [];
    addChartSegment(); // Add one initial segment
    updateStore();
  }
  
  // Drag and drop functionality
  let draggedIndex = -1;
  let dragOverIndex = -1;
  
  function handleDragStart(event, index) {
    // Store the index of the segment being dragged
    draggedIndex = index;
    // Set data for transfer (required for Firefox)
    event.dataTransfer.setData('text/plain', index.toString());
    // Add some opacity to the dragged element for visual feedback
    event.currentTarget.classList.add('dragging');
    // Set effectAllowed to move for appropriate cursor
    event.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragOver(event, index) {
    event.preventDefault(); // Necessary to allow drop
    // Update the dragOverIndex for visual feedback
    dragOverIndex = index;
    // Set dropEffect to move for appropriate cursor
    event.dataTransfer.dropEffect = 'move';
  }
  
  function handleDragEnter(event) {
    // Add a class to highlight the drop target
    event.currentTarget.classList.add('drag-over');
  }
  
  function handleDragLeave(event) {
    // Remove the highlight class when dragging leaves
    event.currentTarget.classList.remove('drag-over');
  }
  
  function handleDrop(event, index) {
    event.preventDefault();
    
    // Get the index of the source segment
    const sourceIndex = draggedIndex;
    // Get the index of the target segment
    const targetIndex = index;
    
    // Don't do anything if dropping on the same segment
    if (sourceIndex === targetIndex) return;
    
    // Clone the segments array to avoid mutation
    const items = [...chartData.items];
    // Remove the dragged segment
    const [draggedItem] = items.splice(sourceIndex, 1);
    // Insert it at the new position
    items.splice(targetIndex, 0, draggedItem);
    
    // Update the chartData with the new order
    chartData.items = items;
    
    // Force store update to ensure reactivity
    updateStore();
    
    // Reset drag state
    draggedIndex = -1;
    dragOverIndex = -1;
    
    // Remove any drag-over styling
    event.currentTarget.classList.remove('drag-over');
  }
  
  function handleDragEnd(event) {
    // Reset styling
    event.currentTarget.classList.remove('dragging');
    // Reset drag state
    draggedIndex = -1;
    dragOverIndex = -1;
    
    // Remove drag-over styling from all segment rows
    document.querySelectorAll('.chart-segment-row').forEach(element => {
      element.classList.remove('drag-over');
    });
  }
</script>

<!-- Center Text Input for Donut Chart -->
<div class="flex flex-col mb-3">
<label for="chart-center-text" class="text-sm font-medium text-gray-700 mb-1">Center Text:</label>
<input 
  type="text" 
  id="chart-center-text" 
  class="w-full px-3 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
  placeholder="Text to display in center of donut (e.g. 100%)"
  value={chartData?.centerText || ''} 
  on:change={updateCenterText}
/>
</div>

<!-- Chart Data Segments Editor -->
<div class="mt-4">
<div class="flex justify-between items-center mb-2">
  <h4 class="text-sm font-medium text-gray-700">Chart Segments</h4>
  
  <!-- Dynamic Data Controls -->
  <div class="flex space-x-2">
    {#if chartData?.items === '{wakatime_chart_data}'}
      <button
        type="button"
        class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
        on:click={resetFromDynamicData}
      >
        Switch to Static Data
      </button>
    {:else}
      <button
        type="button"
        class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
        on:click={setWakatimeData}
      >
        Use WakaTime Data
      </button>
    {/if}
  </div>
</div>

{#if chartData?.items === '{wakatime_chart_data}'}
  <!-- Dynamic Data Placeholder -->
  <div class="bg-gray-50 p-3 rounded border border-gray-200 mb-2">
    <p class="text-sm text-gray-700">
      <span class="font-medium">Using dynamic WakaTime data</span> - Chart will display your actual coding activity at runtime.
    </p>
    <p class="text-xs text-gray-500 mt-1">
      This dynamic data will be populated with your WakaTime programming language usage statistics when the chart is generated.
    </p>
  </div>
{:else}
  <!-- Static Data Segments Editor -->
  {#if chartData?.items && Array.isArray(chartData.items)}
    {#if chartData.items.length === 0}
      <p class="text-sm text-gray-500 italic mb-2">No segments defined yet. Add your first segment below.</p>
    {:else}
      <!-- Header row -->
      <div class="grid grid-cols-12 gap-2 mb-1 px-2">
        <div class="col-span-1"></div> <!-- Space for drag handle -->
        <div class="col-span-4 text-xs font-medium text-gray-500">Label</div>
        <div class="col-span-3 text-xs font-medium text-gray-500">Value</div>
        <div class="col-span-3 text-xs font-medium text-gray-500">Color</div>
        <div class="col-span-1"></div> <!-- Space for delete button -->
      </div>
      
      <!-- Segments -->
      {#each chartData.items as segment, segmentIndex}
        <div class="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded chart-segment-row"
             on:dragover={(e) => handleDragOver(e, segmentIndex)}
             on:dragenter={handleDragEnter}
             on:dragleave={handleDragLeave}
             on:drop={(e) => handleDrop(e, segmentIndex)}
             class:drag-over={dragOverIndex === segmentIndex && draggedIndex !== segmentIndex}
             class:dragging={draggedIndex === segmentIndex}
             role="listitem"
             aria-grabbed={draggedIndex === segmentIndex}>
          
          <!-- Drag handle -->
          <div class="col-span-1 flex items-center justify-center cursor-move"
               draggable="true"
               on:dragstart={(e) => handleDragStart(e, segmentIndex)}
               on:dragend={handleDragEnd}
               role="button"
               aria-label="Drag to reorder"
               tabindex="0">
            <svg class="icon drag-icon text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M5 4.5v7" stroke-linecap="round" />
              <path d="M11 4.5v7" stroke-linecap="round" />
            </svg>
          </div>
          
          <!-- Label input -->
          <div class="col-span-4">
            <input
              type="text"
              class="w-full px-2 py-1 border border-gray-200 rounded text-sm"
              placeholder="Label"
              value={segment.label || ''}
              on:change={(e) => updateSegmentProperty(segmentIndex, 'label', e)}
            />
          </div>
          
          <!-- Value input -->
          <div class="col-span-3">
            <input
              type="number"
              class="w-full px-2 py-1 border border-gray-200 rounded text-sm"
              placeholder="Value"
              min="0"
              value={segment.value || 0}
              on:change={(e) => updateSegmentProperty(segmentIndex, 'value', e)}
            />
          </div>
          
          <!-- Color input -->
          <div class="col-span-3 flex items-center space-x-1">
            <input
              type="color"
              class="h-7 w-7 border border-gray-200 rounded cursor-pointer"
              value={segment.color || '#4285F4'}
              on:change={(e) => updateSegmentProperty(segmentIndex, 'color', e)}
            />
            <input
              type="text"
              class="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
              placeholder="#RRGGBB"
              value={segment.color || '#4285F4'}
              on:change={(e) => updateSegmentProperty(segmentIndex, 'color', e)}
            />
          </div>
          
          <!-- Delete button -->
          <div class="col-span-1 flex justify-center">
              <button
                  type="button"
                  title="Delete segment"
                  on:click={() => deleteChartSegment(segmentIndex)}
                  class="icon-btn p-1 transition-colors bg-gray-50 hover:bg-gray-200
                      text-red-500 hover:text-red-700"
              >
                  <!--  Icon wrapper: creates the gray‑50 disc -->
                  <span class="inline-flex items-center justify-center
                              w-6 h-6 rounded-full bg-gray-50">
                  <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                  >
                      <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16"
                      />
                  </svg>
                  </span>
              </button>              
          </div>
        </div>
      {/each}
    {/if}
    
    <!-- Add segment button -->
    <button
      type="button"
      on:click={addChartSegment}
      class="group w-full mt-2 py-2 px-3 border border-gray-300 rounded-md shadow-sm
              bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-primary flex items-center justify-center
              transition-colors duration-200"
      >
      <!-- Icon: pure white stroke -->
      <svg
          class="w-4 h-4 mr-1 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
      >
          <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
      </svg>

      <!-- Label: original gray, slightly darker on hover -->
      <span class="text-gray-700 group-hover:text-gray-900">
          Add Segment
      </span>
      </button>
  {/if}
{/if}
</div>

<style>
/* Color input styling */
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

/* Drag and drop styles */
.chart-segment-row.drag-over {
  border: 2px dashed #4f46e5;
  padding: 6px; /* Adjust for the border */
}

.chart-segment-row.dragging {
  opacity: 0.6;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Drag handle hover effect */
:global(.dragging) .drag-icon {
  color: #0B93F6; /* primary color */
}
</style>