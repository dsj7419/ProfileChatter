<script>
    import HorizontalBarItemEditor from './HorizontalBarItemEditor.svelte';
    import DonutChartItemEditor from './DonutChartItemEditor.svelte';
    
    // Props
    export let chartData;
    export let updateStore;
    
    // Function to handle chart type change
    function updateChartType(event) {
      // Ensure chartData object exists
      if (!chartData) {
        chartData = {};
      }
      
      // Update chart type
      chartData.type = event.target.value;
      
      // Initialize items array if not present
      if (!chartData.items || !Array.isArray(chartData.items)) {
        chartData.items = [];
      }
      
      // Initialize type-specific properties
      if (chartData.type === 'horizontalBar') {
        // Set maxValue for horizontal bar charts if not present
        if (!chartData.maxValue) {
          chartData.maxValue = 100;
        }
      } else if (chartData.type === 'donut') {
        // Initialize centerText for donut charts if not present
        if (!chartData.centerText) {
          chartData.centerText = '';
        }
      }
      
      // Force store update to ensure reactivity with nested objects
      updateStore();
    }
    
    // Function to handle chart title change
    function updateChartTitle(event) {
      // Ensure chartData object exists
      if (!chartData) {
        chartData = {};
      }
      
      // Update chart title
      chartData.title = event.target.value;
      
      // Force store update to ensure reactivity with nested objects
      updateStore();
    }
</script>

<div class="border-l-4 border-accent pl-3 my-2 space-y-3">
  <!-- Chart Type Selector -->
  <div class="flex flex-col">
    <label for="chart-type" class="text-sm font-medium text-gray-700 mb-1">Chart Type:</label>
    <select 
      id="chart-type" 
      class="w-full px-3 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
      value={chartData?.type || 'horizontalBar'} 
      on:change={updateChartType}
    >
      <option value="horizontalBar">Horizontal Bar</option>
      <option value="donut">Donut Chart</option>
    </select>
  </div>
  
  <!-- Chart Title Input -->
  <div class="flex flex-col">
    <label for="chart-title" class="text-sm font-medium text-gray-700 mb-1">Chart Title:</label>
    <input 
      type="text" 
      id="chart-title" 
      class="w-full px-3 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
      placeholder="Enter chart title..."
      value={chartData?.title || ''} 
      on:change={updateChartTitle}
    />
  </div>
  
  <!-- Specific Chart Type Editors -->
  {#if chartData?.type === 'horizontalBar'}
    <HorizontalBarItemEditor bind:chartData={chartData} {updateStore} />
  {:else if chartData?.type === 'donut'}
    <DonutChartItemEditor bind:chartData={chartData} {updateStore} />
  {/if}
</div>