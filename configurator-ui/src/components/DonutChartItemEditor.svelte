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
          <div class="col-span-5 text-xs font-medium text-gray-500">Label</div>
          <div class="col-span-3 text-xs font-medium text-gray-500">Value</div>
          <div class="col-span-3 text-xs font-medium text-gray-500">Color</div>
          <div class="col-span-1"></div>
        </div>
        
        <!-- Segments -->
        {#each chartData.items as segment, segmentIndex}
          <div class="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded">
            <!-- Label input -->
            <div class="col-span-5">
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
                class="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Delete segment"
                on:click={() => deleteChartSegment(segmentIndex)}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
      
      <!-- Add segment button -->
      <button
        type="button"
        class="w-full mt-2 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
        on:click={addChartSegment}
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Segment
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
</style>