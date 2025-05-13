<script>
    // Props
    export let chartData;
    export let updateStore;
    
    // Function to update chart maxValue
    function updateMaxValue(event) {
      // Parse input value as integer or default to 100
      const value = parseInt(event.target.value, 10);
      chartData.maxValue = isNaN(value) ? 100 : value;
      
      // Force store update to ensure reactivity
      updateStore();
    }
    
    // Function to add a new chart data item
    function addChartItem() {
      // Ensure items array exists
      if (!chartData.items) {
        chartData.items = [];
      }
      
      // Generate a unique color based on the items array length (cycling through some nice colors)
      const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5C6BC0', '#26A69A', '#FFA726', '#EC407A'];
      const colorIndex = chartData.items.length % colors.length;
      
      // Create new item and add to array
      const newItem = {
        label: `Item ${chartData.items.length + 1}`,
        value: 10,
        color: colors[colorIndex]
      };
      
      chartData.items.push(newItem);
      
      // Force store update to ensure reactivity
      updateStore();
    }
    
    // Function to delete a chart data item
    function deleteChartItem(itemIndex) {
      if (window.confirm('Are you sure you want to delete this data item?')) {
        // Remove the item at the specified index
        chartData.items.splice(itemIndex, 1);
        
        // Force store update to ensure reactivity
        updateStore();
      }
    }
    
    // Function to update an item's property
    function updateItemProperty(itemIndex, property, event) {
      let value = event.target.value;
      
      // For value property, convert to number
      if (property === 'value') {
        value = parseInt(value, 10);
        if (isNaN(value)) value = 0;
      }
      
      // Update the property
      chartData.items[itemIndex][property] = value;
      
      // Force store update to ensure reactivity
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
      addChartItem(); // Add one initial item
      updateStore();
    }
</script>

<!-- Max Value Input -->
<div class="flex flex-col">
  <label for="chart-max" class="text-sm font-medium text-gray-700 mb-1">Max Value:</label>
  <input 
    type="number" 
    id="chart-max" 
    class="w-full px-3 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
    min="1"
    placeholder="Maximum value (e.g. 100)"
    value={chartData?.maxValue || 100} 
    on:change={updateMaxValue}
  />
</div>

<!-- Chart Data Items Editor -->
<div class="mt-4">
  <div class="flex justify-between items-center mb-2">
    <h4 class="text-sm font-medium text-gray-700">Chart Data Items</h4>
    
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
    <!-- Static Data Items Editor -->
    {#if chartData?.items && Array.isArray(chartData.items)}
      {#if chartData.items.length === 0}
        <p class="text-sm text-gray-500 italic mb-2">No data items defined yet. Add your first item below.</p>
      {:else}
        <!-- Header row -->
        <div class="grid grid-cols-12 gap-2 mb-1 px-2">
          <div class="col-span-5 text-xs font-medium text-gray-500">Label</div>
          <div class="col-span-3 text-xs font-medium text-gray-500">Value</div>
          <div class="col-span-3 text-xs font-medium text-gray-500">Color</div>
          <div class="col-span-1"></div>
        </div>
        
        <!-- Data items -->
        {#each chartData.items as item, itemIndex}
          <div class="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded">
            <!-- Label input -->
            <div class="col-span-5">
              <input
                type="text"
                class="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                placeholder="Label"
                value={item.label || ''}
                on:change={(e) => updateItemProperty(itemIndex, 'label', e)}
              />
            </div>
            
            <!-- Value input -->
            <div class="col-span-3">
              <input
                type="number"
                class="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                placeholder="Value"
                min="0"
                max={chartData.maxValue || 100}
                value={item.value || 0}
                on:change={(e) => updateItemProperty(itemIndex, 'value', e)}
              />
            </div>
            
            <!-- Color input -->
            <div class="col-span-3 flex items-center space-x-1">
              <input
                type="color"
                class="h-7 w-7 border border-gray-200 rounded cursor-pointer"
                value={item.color || '#4285F4'}
                on:change={(e) => updateItemProperty(itemIndex, 'color', e)}
              />
              <input
                type="text"
                class="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                placeholder="#RRGGBB"
                value={item.color || '#4285F4'}
                on:change={(e) => updateItemProperty(itemIndex, 'color', e)}
              />
            </div>
            
            <!-- Delete button -->
            <div class="col-span-1 flex justify-center">
              <button
                type="button"
                class="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Delete item"
                on:click={() => deleteChartItem(itemIndex)}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
      
      <!-- Add item button -->
      <button
        type="button"
        class="w-full mt-2 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
        on:click={addChartItem}
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Data Item
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