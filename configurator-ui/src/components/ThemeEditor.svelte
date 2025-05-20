<script>
    import { editableTheme, fontOptions, userConfig, previewMode } from '../stores/configStore.js';
    import ColorPicker from './ColorPicker.svelte';
    import HelpIconTooltip from '../lib/ui/HelpIconTooltip.svelte';
    
    // Tab state for top-level categories
    let activeTab = 'general';
    
    // State variable for chart sub-tabs
    let activeChartSubTab = 'general';
    
    // Advanced settings toggles - per section approach
    let showAdvancedGeneral = false;
    let showAdvancedReactions = false;
    let showAdvancedChartGeneral = false;
    let showAdvancedChartBar = false;
    let showAdvancedChartDonut = false;
    
    // Helper for finding first font
    function cleanFontName(fontString) {
      return fontString.split(',')[0].replace(/'/g, '');
    }
    
    // Handle defaults for properties that might be undefined
    $: {
      // Make sure animation values have defaults
      if ($editableTheme.REACTION_ANIMATION_DURATION_SEC === undefined) {
        $editableTheme.REACTION_ANIMATION_DURATION_SEC = 0.3;
      }
      
      if ($editableTheme.REACTION_ANIMATION_DELAY_SEC === undefined) {
        $editableTheme.REACTION_ANIMATION_DELAY_SEC = 0.2;
      }
      
      // Handle chart styles defaults
      if ($editableTheme.CHART_STYLES) {
        if ($editableTheme.CHART_STYLES.CHART_BAR_ANIMATION_DURATION_SEC === undefined) {
          $editableTheme.CHART_STYLES.CHART_BAR_ANIMATION_DURATION_SEC = 0.8;
        }
        
        if ($editableTheme.CHART_STYLES.CHART_ANIMATION_DELAY_SEC === undefined) {
          $editableTheme.CHART_STYLES.CHART_ANIMATION_DELAY_SEC = 0.3;
        }
        
        if ($editableTheme.CHART_STYLES.BAR_ANIMATION_DURATION_SEC === undefined) {
          $editableTheme.CHART_STYLES.BAR_ANIMATION_DURATION_SEC = 0.8;
        }
      }
    }
    
    // Function to set active chart sub-tab
    function setChartSubTab(tabId) {
      activeChartSubTab = tabId;
      console.log('Chart sub-tab changed to:', tabId);
    }
    
    // Toggle advanced settings for a section
    function toggleAdvanced(section) {
      switch(section) {
        case 'general':
          showAdvancedGeneral = !showAdvancedGeneral;
          break;
        case 'reactions':
          showAdvancedReactions = !showAdvancedReactions;
          break;
        case 'chartGeneral':
          showAdvancedChartGeneral = !showAdvancedChartGeneral;
          break;
        case 'chartBar':
          showAdvancedChartBar = !showAdvancedChartBar;
          break;
        case 'chartDonut':
          showAdvancedChartDonut = !showAdvancedChartDonut;
          break;
      }
    }
  </script>
  
  <div class="theme-editor p-3 border border-gray-200 rounded-md bg-white">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Theme Editor</h3>
    
    <!-- Main Tab Navigation with modified chat bubbles label -->
    <div class="theme-tabs flex border-b border-gray-200 mb-4">
      <button 
        class="px-4 py-2 text-sm font-medium {activeTab === 'general' ? 'text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}" 
        on:click={() => activeTab = 'general'}
      >
        General
      </button>
      <button 
        class="px-4 py-2 text-sm font-medium {activeTab === 'bubbles' ? 'text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}" 
        on:click={() => activeTab = 'bubbles'}
      >
        Chat<br>Bubbles
      </button>
      <button 
        class="px-4 py-2 text-sm font-medium {activeTab === 'reactions' ? 'text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}" 
        on:click={() => activeTab = 'reactions'}
      >
        Reactions
      </button>
      <button 
        class="px-4 py-2 text-sm font-medium {activeTab === 'charts' ? 'text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}" 
        on:click={() => activeTab = 'charts'}
      >
        Charts
      </button>
    </div>
    
    <!-- General Settings Tab -->
    {#if activeTab === 'general'}
        <div class="theme-panel space-y-4">
            <!-- Toggle for Advanced Settings -->
            <div class="flex justify-end mb-2">
                <button 
                    class="text-xs font-medium text-primary flex items-center gap-1" 
                    on:click={() => toggleAdvanced('general')}
                >
                    <span>{showAdvancedGeneral ? 'Hide' : 'Show'} Advanced Settings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showAdvancedGeneral ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                </button>
            </div>
            
            <!-- Background Colors -->
            <div class="section">
                <h4 class="text-xs font-medium text-gray-700 mb-2">Background Colors</h4>
                
                <!-- Basic Mode: Dynamic Background Color Input -->
                {#if !showAdvancedGeneral}
                    {#if $previewMode === 'light'}
                        <ColorPicker 
                            id="bg-light" 
                            label="Light Background" 
                            bind:value={$editableTheme.BACKGROUND_LIGHT} 
                        />
                    {:else}
                        <ColorPicker 
                            id="bg-dark" 
                            label="Dark Background" 
                            bind:value={$editableTheme.BACKGROUND_DARK} 
                        />
                    {/if}
                {/if}

                <!-- Advanced Mode: Both Background Color Inputs -->
                {#if showAdvancedGeneral}
                    <ColorPicker 
                        id="bg-light-adv" 
                        label="Light Background" 
                        bind:value={$editableTheme.BACKGROUND_LIGHT} 
                    />
                    
                    <ColorPicker 
                        id="bg-dark-adv" 
                        label="Dark Background" 
                        bind:value={$editableTheme.BACKGROUND_DARK} 
                    />
                {/if}
            </div>
            
            <!-- Typography (basic) -->
            <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Global Typography</h4>
            
            <!-- FONT_FAMILY -->
            <div>
                <label for="font-family" class="block text-xs font-medium text-gray-500 mb-1">Default Font Family</label>
                <select 
                id="font-family" 
                bind:value={$editableTheme.FONT_FAMILY} 
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                >
                {#each $fontOptions.standard as fontString (fontString)}
                    <option value={fontString} style="font-family: {fontString};">
                    {cleanFontName(fontString)}
                    </option>
                {/each}
                </select>
            </div>
            </div>
            
            <!-- Global Animation (advanced) -->
            {#if showAdvancedGeneral}
                <div class="section">
                <h4 class="text-xs font-medium text-gray-700 mb-2">Global Animation</h4>
                
                  <div>
                    <label for="scroll-speed-multiplier" class="block text-xs font-medium text-gray-500 mb-1">
                      Scroll Speed Multiplier (0.5x - 2x)
                      <HelpIconTooltip text="Controls the speed of all scrolling animations in your profile. Lower values create slower, smoother animations while higher values make animations faster." />
                    </label>
                    <input 
                      type="range" 
                      id="scroll-speed-multiplier" 
                      bind:value={$userConfig.layout.ANIMATION.SCROLL_SPEED_MULTIPLIER} 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
                    />
                    <div class="text-xs text-gray-500 text-center">
                      Current: {$userConfig.layout.ANIMATION.SCROLL_SPEED_MULTIPLIER}x
                    </div>
                    <p class="text-xs text-gray-500 italic ml-1 mt-1">(Preview updates live; full refresh needed only for new SVG)</p>
                  </div>
                </div>
            {/if}
            
            <!-- Advanced settings indicator when hidden -->
            {#if !showAdvancedGeneral}
                <div class="text-xs text-gray-500 italic">
                    <p>Advanced settings hidden: {$previewMode === 'light' ? 'Dark' : 'Light'} background color, animation settings</p>
                </div>
            {/if}
        </div>
    {/if}
    
    <!-- Chat Bubbles Tab (all settings considered basic) -->
    {#if activeTab === 'bubbles'}
      <div class="theme-panel space-y-4">
        <!-- Message Bubble Appearance -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Bubble Appearance</h4>
          
          <!-- BUBBLE_RADIUS_PX -->
          <div class="mb-3">
            <label for="bubble-radius" class="block text-xs font-medium text-gray-500 mb-1">
              Corner Radius (px)
              <HelpIconTooltip text="Controls how rounded the corners of chat bubbles appear. Higher values create more rounded corners."/>
            </label>
            <input 
              type="number" 
              id="bubble-radius" 
              bind:value={$editableTheme.BUBBLE_RADIUS_PX} 
              min="0"
              max="30"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
        
        <!-- User Bubbles (Me) -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">User Bubbles (Me)</h4>
          
          <!-- ME_BUBBLE_COLOR -->
          <ColorPicker 
              id="me-bubble-color" 
              label="Background Color" 
              bind:value={$editableTheme.ME_BUBBLE_COLOR} 
          />
          
          <!-- ME_TEXT_COLOR -->
          <ColorPicker 
              id="me-text-color" 
              label="Text Color" 
              bind:value={$editableTheme.ME_TEXT_COLOR} 
          />
        </div>
        
        <!-- Visitor Bubbles -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Visitor Bubbles</h4>
          
          <!-- VISITOR_BUBBLE_COLOR -->
          <ColorPicker 
              id="visitor-bubble-color" 
              label="Background Color" 
              bind:value={$editableTheme.VISITOR_BUBBLE_COLOR} 
          />
          
          <!-- VISITOR_TEXT_COLOR -->
          <ColorPicker 
              id="visitor-text-color" 
              label="Text Color" 
              bind:value={$editableTheme.VISITOR_TEXT_COLOR} 
          />
        </div>
      </div>
    {/if}
    
    <!-- Reactions Tab -->
    {#if activeTab === 'reactions'}
      <div class="theme-panel space-y-4">
        <!-- Toggle for Advanced Settings -->
        <div class="flex justify-end mb-2">
            <button 
                class="text-xs font-medium text-primary flex items-center gap-1" 
                on:click={() => toggleAdvanced('reactions')}
            >
                <span>{showAdvancedReactions ? 'Hide' : 'Show'} Advanced Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showAdvancedReactions ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
            </button>
        </div>
        
        <!-- Reaction Appearance -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Appearance</h4>
          
          <!-- REACTION_BG_COLOR (basic) -->
          <ColorPicker 
              id="reaction-bg-color" 
              label="Background Color" 
              bind:value={$editableTheme.REACTION_BG_COLOR} 
          />
          
          <!-- REACTION_BG_OPACITY (advanced) -->
          {#if showAdvancedReactions}
              <div class="mb-3">
                <label for="reaction-bg-opacity" class="block text-xs font-medium text-gray-500 mb-1">Background Opacity</label>
                <input 
                  type="number" 
                  id="reaction-bg-opacity" 
                  bind:value={$editableTheme.REACTION_BG_OPACITY} 
                  min="0"
                  max="1"
                  step="0.01"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
          {/if}
          
          <!-- REACTION_TEXT_COLOR (basic) -->
          <ColorPicker 
              id="reaction-text-color" 
              label="Text Color" 
              bind:value={$editableTheme.REACTION_TEXT_COLOR} 
          />
          
          <!-- REACTION_BORDER_RADIUS_PX (basic) -->
          <div>
            <label for="reaction-border-radius" class="block text-xs font-medium text-gray-500 mb-1">Border Radius (px)</label>
            <input 
              type="number" 
              id="reaction-border-radius" 
              bind:value={$editableTheme.REACTION_BORDER_RADIUS_PX} 
              min="0"
              max="30"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
        
        <!-- Reaction Sizing & Spacing -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Sizing & Spacing</h4>
          
          <!-- REACTION_FONT_SIZE_PX (basic) -->
          <div class="mb-3">
            <label for="reaction-font-size" class="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
            <input 
              type="number" 
              id="reaction-font-size" 
              bind:value={$editableTheme.REACTION_FONT_SIZE_PX} 
              min="8"
              max="30"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <!-- REACTION_PADDING_X_PX (advanced) -->
          {#if showAdvancedReactions}
              <div class="mb-3">
                <label for="reaction-padding-x" class="block text-xs font-medium text-gray-500 mb-1">Horizontal Padding (px)</label>
                <input 
                  type="number" 
                  id="reaction-padding-x" 
                  bind:value={$editableTheme.REACTION_PADDING_X_PX} 
                  min="0"
                  max="20"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              
              <!-- REACTION_PADDING_Y_PX (advanced) -->
              <div>
                <label for="reaction-padding-y" class="block text-xs font-medium text-gray-500 mb-1">Vertical Padding (px)</label>
                <input 
                  type="number" 
                  id="reaction-padding-y" 
                  bind:value={$editableTheme.REACTION_PADDING_Y_PX} 
                  min="0"
                  max="20"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
          {/if}
        </div>
        
        <!-- Reaction Positioning (advanced) -->
        {#if showAdvancedReactions}
            <div class="section">
              <h4 class="text-xs font-medium text-gray-700 mb-2">Positioning</h4>
              
              <!-- REACTION_OFFSET_X_PX -->
              <div class="mb-3">
                <label for="reaction-offset-x" class="block text-xs font-medium text-gray-500 mb-1">Horizontal Offset (px)</label>
                <input 
                  type="number" 
                  id="reaction-offset-x" 
                  bind:value={$editableTheme.REACTION_OFFSET_X_PX} 
                  min="-50"
                  max="50"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              
              <!-- REACTION_OFFSET_Y_PX -->
              <div>
                <label for="reaction-offset-y" class="block text-xs font-medium text-gray-500 mb-1">Vertical Offset (px)</label>
                <input 
                  type="number" 
                  id="reaction-offset-y" 
                  bind:value={$editableTheme.REACTION_OFFSET_Y_PX} 
                  min="-50"
                  max="50"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- Reaction Animation (advanced) -->
            <div class="section">
              <h4 class="text-xs font-medium text-gray-700 mb-2">Animation</h4>
              
              <!-- REACTION_ANIMATION_DURATION_SEC -->
              <div class="mb-3">
                <label for="reaction-animation-duration" class="block text-xs font-medium text-gray-500 mb-1">Animation Duration (sec)</label>
                <input 
                  type="number" 
                  id="reaction-animation-duration" 
                  bind:value={$editableTheme.REACTION_ANIMATION_DURATION_SEC} 
                  min="0"
                  max="2"
                  step="0.1"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              
              <!-- REACTION_ANIMATION_DELAY_SEC -->
              <div>
                <label for="reaction-animation-delay" class="block text-xs font-medium text-gray-500 mb-1">Animation Delay (sec)</label>
                <input 
                  type="number" 
                  id="reaction-animation-delay" 
                  bind:value={$editableTheme.REACTION_ANIMATION_DELAY_SEC} 
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
        {/if}
        
        <!-- Advanced settings indicator when hidden -->
        {#if !showAdvancedReactions}
            <div class="text-xs text-gray-500 italic">
                <p>Advanced settings hidden: Background opacity, padding, positioning, animation settings</p>
            </div>
        {/if}
      </div>
    {/if}
    
    <!-- Charts Tab with Sub-navigation -->
    {#if activeTab === 'charts'}
      <!-- Chart Sub-navigation -->
      <div class="charts-subnav flex mb-4">
        <div class="flex overflow-x-auto py-1 bg-gray-50 rounded-md w-full">
          <!-- Use Svelte-native click handlers with state variables instead of DOM manipulation -->
          <button 
            class="chart-tab-btn {activeChartSubTab === 'general' ? 'active' : ''}" 
            on:click={() => setChartSubTab('general')}
          >
            General
          </button>
          <button 
            class="chart-tab-btn {activeChartSubTab === 'bar' ? 'active' : ''}" 
            on:click={() => setChartSubTab('bar')}
          >
            Bar Charts
          </button>
          <button 
            class="chart-tab-btn {activeChartSubTab === 'donut' ? 'active' : ''}" 
            on:click={() => setChartSubTab('donut')}
          >
            Donut Charts
          </button>
        </div>
      </div>
      
      <!-- General Chart Settings -->
      <div class="chart-panel {activeChartSubTab === 'general' ? 'active' : ''}" id="chart-general">
        <!-- Toggle for Advanced Settings -->
        <div class="flex justify-end mb-2">
            <button 
                class="text-xs font-medium text-primary flex items-center gap-1" 
                on:click={() => toggleAdvanced('chartGeneral')}
            >
                <span>{showAdvancedChartGeneral ? 'Hide' : 'Show'} Advanced Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showAdvancedChartGeneral ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
            </button>
        </div>
        
        <div class="space-y-4">
          <!-- Layout & Spacing (advanced) -->
          {#if showAdvancedChartGeneral}
              <div class="section">
                <h4 class="text-xs font-medium text-gray-700 mb-2">Layout & Spacing</h4>
                
                <!-- CHART_PADDING_X_PX -->
                <div class="mb-3">
                  <label for="chart-padding-x" class="block text-xs font-medium text-gray-500 mb-1">Horizontal Padding (px)</label>
                  <input 
                    type="number" 
                    id="chart-padding-x" 
                    bind:value={$editableTheme.CHART_STYLES.CHART_PADDING_X_PX} 
                    min="0"
                    max="50"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                
                <!-- CHART_PADDING_Y_PX -->
                <div>
                  <label for="chart-padding-y" class="block text-xs font-medium text-gray-500 mb-1">Vertical Padding (px)</label>
                  <input 
                    type="number" 
                    id="chart-padding-y" 
                    bind:value={$editableTheme.CHART_STYLES.CHART_PADDING_Y_PX} 
                    min="0"
                    max="50"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>
              
              <!-- Grid & Axis (advanced) -->
              <div class="section">
                <h4 class="text-xs font-medium text-gray-700 mb-2">Grid & Axis</h4>
                
                <!-- AXIS_LINE_COLOR -->
                <ColorPicker 
                    id="axis-line-color" 
                    label="Axis Line Color" 
                    bind:value={$editableTheme.CHART_STYLES.AXIS_LINE_COLOR} 
                />
                
                <!-- GRID_LINE_COLOR -->
                <ColorPicker 
                    id="grid-line-color" 
                    label="Grid Line Color" 
                    bind:value={$editableTheme.CHART_STYLES.GRID_LINE_COLOR} 
                />
              </div>
          {/if}
          
          <!-- Common Typography -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Typography</h4>
            
            <!-- Title Settings -->
            <div class="mb-4">
              <h5 class="text-xs font-medium text-gray-500 mb-2">Chart Titles</h5>
              
              <!-- TITLE_FONT_FAMILY (advanced) -->
              {#if showAdvancedChartGeneral}
                  <div class="mb-3">
                    <label for="title-font-family" class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                    <select 
                      id="title-font-family" 
                      bind:value={$editableTheme.CHART_STYLES.TITLE_FONT_FAMILY}
                      class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    >
                      {#each $fontOptions.standard as fontString (fontString)}
                        <option value={fontString} style="font-family: {fontString};">
                          {cleanFontName(fontString)}
                        </option>
                      {/each}
                    </select>
                  </div>
              {/if}
              
              <!-- TITLE_FONT_SIZE_PX (basic) -->
              <div class="mb-3">
                <label for="title-font-size" class="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
                <input 
                  type="number" 
                  id="title-font-size" 
                  bind:value={$editableTheme.CHART_STYLES.TITLE_FONT_SIZE_PX} 
                  min="8"
                  max="28"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              
              <!-- TITLE_LINE_HEIGHT_MULTIPLIER (advanced) -->
              {#if showAdvancedChartGeneral}
                  <div class="mb-3">
                    <label for="title-line-height" class="block text-xs font-medium text-gray-500 mb-1">Line Height Multiplier</label>
                    <input 
                      type="number" 
                      id="title-line-height" 
                      bind:value={$editableTheme.CHART_STYLES.TITLE_LINE_HEIGHT_MULTIPLIER} 
                      min="0.5"
                      max="3"
                      step="0.1"
                      class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  
                  <!-- TITLE_BOTTOM_MARGIN_PX (advanced) -->
                  <div>
                    <label for="title-bottom-margin" class="block text-xs font-medium text-gray-500 mb-1">Bottom Margin (px)</label>
                    <input 
                      type="number" 
                      id="title-bottom-margin" 
                      bind:value={$editableTheme.CHART_STYLES.TITLE_BOTTOM_MARGIN_PX} 
                      min="0"
                      max="50"
                      class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
              {/if}
            </div>
            
            <!-- Labels Settings -->
            <div class="mb-4">
              <h5 class="text-xs font-medium text-gray-500 mb-2">Chart Labels</h5>
              
              <!-- LABEL_FONT_FAMILY (advanced) -->
              {#if showAdvancedChartGeneral}
                  <div class="mb-3">
                    <label for="label-font-family" class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                    <select 
                      id="label-font-family" 
                      bind:value={$editableTheme.CHART_STYLES.LABEL_FONT_FAMILY}
                      class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    >
                      {#each $fontOptions.standard as fontString (fontString)}
                        <option value={fontString} style="font-family: {fontString};">
                          {cleanFontName(fontString)}
                        </option>
                      {/each}
                    </select>
                  </div>
              {/if}
              
              <!-- LABEL_FONT_SIZE_PX (basic) -->
              <div>
                <label for="label-font-size" class="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
                <input 
                  type="number" 
                  id="label-font-size" 
                  bind:value={$editableTheme.CHART_STYLES.LABEL_FONT_SIZE_PX} 
                  min="8"
                  max="24"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- Values Settings -->
            <div>
              <h5 class="text-xs font-medium text-gray-500 mb-2">Chart Values</h5>
              
              <!-- VALUE_TEXT_FONT_FAMILY (advanced) -->
              {#if showAdvancedChartGeneral}
                  <div class="mb-3">
                    <label for="value-text-font-family" class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                    <select 
                      id="value-text-font-family" 
                      bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_FONT_FAMILY}
                      class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    >
                      {#each $fontOptions.standard as fontString (fontString)}
                        <option value={fontString} style="font-family: {fontString};">
                          {cleanFontName(fontString)}
                        </option>
                      {/each}
                    </select>
                  </div>
              {/if}
              
              <!-- VALUE_TEXT_FONT_SIZE_PX (basic) -->
              <div class="mb-3">
                <label for="value-text-font-size" class="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
                <input 
                  type="number" 
                  id="value-text-font-size" 
                  bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_FONT_SIZE_PX} 
                  min="8"
                  max="24"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              
              <!-- VALUE_TEXT_INSIDE_COLOR (advanced) -->
              {#if showAdvancedChartGeneral}
                  <ColorPicker 
                      id="value-text-inside-color" 
                      label="Inside Text Color" 
                      bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_INSIDE_COLOR} 
                  >
                    <HelpIconTooltip text="Text color when values are displayed inside chart bars. Choose a color that contrasts well against bar colors for readability."/>
                  </ColorPicker>
              {/if}
            </div>
          </div>
          
          <!-- User-specific Colors (Me) (basic) -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">User Colors (Me)</h4>
            
            <!-- ME_TITLE_COLOR -->
            <ColorPicker 
                id="me-title-color" 
                label="Title Color" 
                bind:value={$editableTheme.CHART_STYLES.ME_TITLE_COLOR} 
            />
            
            <!-- ME_LABEL_COLOR -->
            <ColorPicker 
                id="me-label-color" 
                label="Label Color" 
                bind:value={$editableTheme.CHART_STYLES.ME_LABEL_COLOR} 
            />
            
            <!-- ME_VALUE_TEXT_COLOR -->
            <ColorPicker 
                id="me-value-text-color" 
                label="Value Text Color" 
                bind:value={$editableTheme.CHART_STYLES.ME_VALUE_TEXT_COLOR} 
            />
          </div>
          
          <!-- Visitor-specific Colors (basic) -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Visitor Colors</h4>
            
            <!-- VISITOR_TITLE_COLOR -->
            <ColorPicker 
                id="visitor-title-color" 
                label="Title Color" 
                bind:value={$editableTheme.CHART_STYLES.VISITOR_TITLE_COLOR} 
            />
            
            <!-- VISITOR_LABEL_COLOR -->
            <ColorPicker 
                id="visitor-label-color" 
                label="Label Color" 
                bind:value={$editableTheme.CHART_STYLES.VISITOR_LABEL_COLOR} 
            />
            
            <!-- VISITOR_VALUE_TEXT_COLOR -->
            <ColorPicker 
                id="visitor-value-text-color" 
                label="Value Text Color" 
                bind:value={$editableTheme.CHART_STYLES.VISITOR_VALUE_TEXT_COLOR} 
            />
          </div>
          
          <!-- Chart Animation -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Animation (All Charts)</h4>
            
            <!-- CHART_BAR_ANIMATION_DURATION_SEC (basic) -->
            <div class="mb-3">
              <label for="chart-animation-duration" class="block text-xs font-medium text-gray-500 mb-1">
                Animation Duration (sec)
                <HelpIconTooltip text="Controls how long chart animations run. Lower values create faster animations, higher values create slower animations."/>
              </label>
              <input 
                type="number" 
                id="chart-animation-duration" 
                bind:value={$editableTheme.CHART_STYLES.CHART_BAR_ANIMATION_DURATION_SEC} 
                min="0"
                max="3"
                step="0.1"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
              <p class="text-xs text-gray-500 italic ml-1">(Requires Preview Refresh)</p>
            </div>
            
            <!-- CHART_ANIMATION_DELAY_SEC (advanced) -->
            {#if showAdvancedChartGeneral}
                <div>
                  <label for="chart-animation-delay" class="block text-xs font-medium text-gray-500 mb-1">Animation Delay (sec)</label>
                  <input 
                    type="number" 
                    id="chart-animation-delay" 
                    bind:value={$editableTheme.CHART_STYLES.CHART_ANIMATION_DELAY_SEC} 
                    min="0"
                    max="2"
                    step="0.1"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                  <p class="text-xs text-gray-500 italic ml-1">(Requires Preview Refresh)</p>
                </div>
            {/if}
          </div>
          
          <!-- Advanced settings indicator when hidden -->
          {#if !showAdvancedChartGeneral}
              <div class="text-xs text-gray-500 italic">
                  <p>Advanced settings hidden: Layout spacing, grid/axis colors, font families, line height, margins, and animation delay</p>
              </div>
          {/if}
        </div>
      </div>
      
      <!-- Bar Chart Settings -->
      <div class="chart-panel {activeChartSubTab === 'bar' ? 'active' : ''}" id="chart-bar">
        <!-- Toggle for Advanced Settings -->
        <div class="flex justify-end mb-2">
            <button 
                class="text-xs font-medium text-primary flex items-center gap-1" 
                on:click={() => toggleAdvanced('chartBar')}
            >
                <span>{showAdvancedChartBar ? 'Hide' : 'Show'} Advanced Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showAdvancedChartBar ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
            </button>
        </div>
        
        <div class="space-y-4">
          <!-- Bar Appearance -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Bar Appearance</h4>
            
            <!-- BAR_DEFAULT_COLOR (basic) -->
            <ColorPicker 
                id="bar-default-color" 
                label="Default Bar Color" 
                bind:value={$editableTheme.CHART_STYLES.BAR_DEFAULT_COLOR} 
            />
            
            <!-- BAR_TRACK_COLOR (advanced) -->
            {#if showAdvancedChartBar}
                <ColorPicker 
                    id="bar-track-color" 
                    label="Track Color" 
                    bind:value={$editableTheme.CHART_STYLES.BAR_TRACK_COLOR} 
                />
            {/if}
            
            <!-- BAR_CORNER_RADIUS_PX (basic) -->
            <div>
              <label for="bar-corner-radius" class="block text-xs font-medium text-gray-500 mb-1">Corner Radius (px)</label>
              <input 
                type="number" 
                id="bar-corner-radius" 
                bind:value={$editableTheme.CHART_STYLES.BAR_CORNER_RADIUS_PX} 
                min="0"
                max="20"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <!-- Bar Dimensions -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Bar Dimensions</h4>
            
            <!-- BAR_HEIGHT_PX (basic) -->
            <div class="mb-3">
              <label for="bar-height" class="block text-xs font-medium text-gray-500 mb-1">Bar Height (px)</label>
              <input 
                type="number" 
                id="bar-height" 
                bind:value={$editableTheme.CHART_STYLES.BAR_HEIGHT_PX} 
                min="1"
                max="40"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            
            <!-- BAR_SPACING_PX (advanced) -->
            {#if showAdvancedChartBar}
                <div>
                  <label for="bar-spacing" class="block text-xs font-medium text-gray-500 mb-1">Bar Spacing (px)</label>
                  <input 
                    type="number" 
                    id="bar-spacing" 
                    bind:value={$editableTheme.CHART_STYLES.BAR_SPACING_PX} 
                    min="0"
                    max="40"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
            {/if}
          </div>
          
          <!-- Bar Animation (advanced) -->
          {#if showAdvancedChartBar}
              <div class="section">
                <h4 class="text-xs font-medium text-gray-700 mb-2">Bar Animation</h4>
                
                <!-- BAR_ANIMATION_DURATION_SEC -->
                <div>
                  <label for="bar-animation-duration" class="block text-xs font-medium text-gray-500 mb-1">Animation Duration (sec)</label>
                  <input 
                    type="number" 
                    id="bar-animation-duration" 
                    bind:value={$editableTheme.CHART_STYLES.BAR_ANIMATION_DURATION_SEC} 
                    min="0"
                    max="3"
                    step="0.1"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                  <p class="text-xs text-gray-500 italic ml-1">(Requires Preview Refresh)</p>
                </div>
              </div>
          {/if}
          
          <!-- Advanced settings indicator when hidden -->
          {#if !showAdvancedChartBar}
              <div class="text-xs text-gray-500 italic">
                  <p>Advanced settings hidden: Track color, bar spacing, animation duration</p>
              </div>
          {/if}
        </div>
      </div>
      
      <!-- Donut Chart Settings -->
      <div class="chart-panel {activeChartSubTab === 'donut' ? 'active' : ''}" id="chart-donut">
        <!-- Toggle for Advanced Settings -->
        <div class="flex justify-end mb-2">
            <button 
                class="text-xs font-medium text-primary flex items-center gap-1" 
                on:click={() => toggleAdvanced('chartDonut')}
            >
                <span>{showAdvancedChartDonut ? 'Hide' : 'Show'} Advanced Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showAdvancedChartDonut ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
            </button>
        </div>
        
        <div class="space-y-4">
          <!-- Donut Appearance (basic) -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Donut Appearance</h4>
            
            <!-- DONUT_STROKE_WIDTH_PX -->
            <div>
              <label for="donut-stroke-width" class="block text-xs font-medium text-gray-500 mb-1">
                Stroke Width (px)
                <HelpIconTooltip text="Controls the thickness of the donut chart ring. Larger values create thicker rings, smaller values create thinner rings."/>
              </label>
              <input 
                type="number" 
                id="donut-stroke-width" 
                bind:value={$editableTheme.CHART_STYLES.DONUT_STROKE_WIDTH_PX} 
                min="1"
                max="50"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
              <p class="text-xs text-gray-500 italic ml-1">(Requires Preview Refresh)</p>
            </div>
          </div>
          
          <!-- Donut Center Text -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Center Text</h4>
            
            <!-- DONUT_CENTER_TEXT_FONT_FAMILY (advanced) -->
            {#if showAdvancedChartDonut}
                <div class="mb-3">
                  <label for="donut-center-text-font-family" class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                  <select 
                    id="donut-center-text-font-family" 
                    bind:value={$editableTheme.CHART_STYLES.DONUT_CENTER_TEXT_FONT_FAMILY}
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  >
                    {#each $fontOptions.standard as fontString (fontString)}
                      <option value={fontString} style="font-family: {fontString};">
                        {cleanFontName(fontString)}
                      </option>
                    {/each}
                  </select>
                </div>
            {/if}
            
            <!-- DONUT_CENTER_TEXT_FONT_SIZE_PX (basic) -->
            <div class="mb-3">
              <label for="donut-center-text-font-size" class="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
              <input 
                type="number" 
                id="donut-center-text-font-size" 
                bind:value={$editableTheme.CHART_STYLES.DONUT_CENTER_TEXT_FONT_SIZE_PX} 
                min="8"
                max="28"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            
            <!-- ME_DONUT_CENTER_TEXT_COLOR (basic) -->
            <ColorPicker 
                id="me-donut-center-text-color" 
                label="Me Text Color" 
                bind:value={$editableTheme.CHART_STYLES.ME_DONUT_CENTER_TEXT_COLOR} 
            />
            
            <!-- VISITOR_DONUT_CENTER_TEXT_COLOR (basic) -->
            <ColorPicker 
                id="visitor-donut-center-text-color" 
                label="Visitor Text Color" 
                bind:value={$editableTheme.CHART_STYLES.VISITOR_DONUT_CENTER_TEXT_COLOR} 
            />
          </div>
          
          <!-- Donut Legend -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Legend</h4>
            
            <!-- DONUT_LEGEND_FONT_SIZE_PX (basic) -->
            <div class="mb-3">
              <label for="donut-legend-font-size" class="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
              <input 
                type="number" 
                id="donut-legend-font-size" 
                bind:value={$editableTheme.CHART_STYLES.DONUT_LEGEND_FONT_SIZE_PX} 
                min="8"
                max="24"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            
            <!-- Legend Colors and Spacing (advanced) -->
            {#if showAdvancedChartDonut}
                <!-- ME_DONUT_LEGEND_TEXT_COLOR -->
                <ColorPicker 
                    id="me-donut-legend-text-color" 
                    label="Me Legend Text Color" 
                    bind:value={$editableTheme.CHART_STYLES.ME_DONUT_LEGEND_TEXT_COLOR} 
                />
                
                <!-- VISITOR_DONUT_LEGEND_TEXT_COLOR -->
                <ColorPicker 
                    id="visitor-donut-legend-text-color" 
                    label="Visitor Legend Text Color" 
                    bind:value={$editableTheme.CHART_STYLES.VISITOR_DONUT_LEGEND_TEXT_COLOR} 
                />
                
                <!-- DONUT_LEGEND_ITEM_SPACING_PX -->
                <div class="mb-3">
                  <label for="donut-legend-item-spacing" class="block text-xs font-medium text-gray-500 mb-1">Item Spacing (px)</label>
                  <input 
                    type="number" 
                    id="donut-legend-item-spacing" 
                    bind:value={$editableTheme.CHART_STYLES.DONUT_LEGEND_ITEM_SPACING_PX} 
                    min="0"
                    max="30"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                
                <!-- DONUT_LEGEND_MARKER_SIZE_PX -->
                <div>
                  <label for="donut-legend-marker-size" class="block text-xs font-medium text-gray-500 mb-1">Marker Size (px)</label>
                  <input 
                    type="number" 
                    id="donut-legend-marker-size" 
                    bind:value={$editableTheme.CHART_STYLES.DONUT_LEGEND_MARKER_SIZE_PX} 
                    min="1"
                    max="30"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
            {/if}
          </div>
          
          <!-- Donut Animation -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Animation</h4>
            
            <!-- DONUT_ANIMATION_DURATION_SEC (basic) -->
            <div class="mb-3">
              <label for="donut-animation-duration" class="block text-xs font-medium text-gray-500 mb-1">Animation Duration (sec)</label>
              <input 
                type="number" 
                id="donut-animation-duration" 
                bind:value={$editableTheme.CHART_STYLES.DONUT_ANIMATION_DURATION_SEC} 
                min="0.1"
                max="5"
                step="0.1"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
              <p class="text-xs text-gray-500 italic ml-1">(Requires Preview Refresh)</p>
            </div>
            
            <!-- DONUT_SEGMENT_ANIMATION_DELAY_SEC (advanced) -->
            {#if showAdvancedChartDonut}
                <div>
                  <label for="donut-segment-delay" class="block text-xs font-medium text-gray-500 mb-1">Segment Delay (sec)</label>
                  <input 
                    type="number" 
                    id="donut-segment-delay" 
                    bind:value={$editableTheme.CHART_STYLES.DONUT_SEGMENT_ANIMATION_DELAY_SEC} 
                    min="0"
                    max="1"
                    step="0.01"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                  <p class="text-xs text-gray-500 italic ml-1">(Requires Preview Refresh)</p>
                </div>
            {/if}
          </div>
          
          <!-- Advanced settings indicator when hidden -->
          {#if !showAdvancedChartDonut}
              <div class="text-xs text-gray-500 italic">
                  <p>Advanced settings hidden: Font family, legend colors, spacing, marker size, and animation delay</p>
              </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    /* ============ MAIN TAB BAR ============ */
    .theme-tabs {
      display: flex;
      flex-wrap: nowrap;            /* Try to keep tabs on one line */
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1rem;
      gap: 0.125rem;                /* Tighter spacing between tabs */
    }
    
    /* Tab button styling - more compact */
    .theme-tabs button {
      padding: 0.25rem 0.375rem;    /* Very compact padding */
      font-size: 0.75rem;           /* Smaller text size */
      font-weight: 500;
      color: #6b7280;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;          /* To offset the parent border */
      flex: 1 1 0;                  /* Equal width for all tabs */
      min-width: 2.75rem;           /* Smaller minimum width */
      text-align: center;
      transition: all 0.15s ease;
      cursor: pointer;
      white-space: normal;          /* Allow text to wrap within tabs */
      line-height: 1.1;             /* Tighter line height for wrapped text */
      height: 2.25rem;              /* Fixed height for all tabs */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Active tab styling - more prominent */
    .theme-tabs button.text-primary {
      color: #4f46e5;
      border-bottom-color: #4f46e5;
      background-color: rgba(79, 70, 229, 0.05); /* Very subtle background */
      font-weight: 600;
    }
    
    /* Hover effect for non-active tabs */
    .theme-tabs button:not(.text-primary):hover {
      color: #4338ca;
      background-color: rgba(79, 70, 229, 0.03);
    }
    
    /* ============ CONTENT SECTIONS ============ */
    .section {
      padding: 1rem;
      border: 1px solid #f0f0f0;
      border-radius: 0.375rem;
      background-color: #fafafa;
      margin-bottom: 1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    /* Section headings */
    .section h4 {
      margin-bottom: 0.75rem;
      color: #374151;
    }
    
    /* ============ CHART SUB-NAVIGATION ============ */
    .charts-subnav {
      display: flex;
      margin-bottom: 1rem;
    }
    
    .charts-subnav > div {
      display: flex;
      flex-wrap: nowrap;       /* Try to keep on one line */
      width: 100%;
      background-color: #f9fafb;
      border-radius: 0.25rem;
      padding: 0.125rem;
      gap: 0.125rem;           /* Tighter spacing */
    }
    
    /* Chart tab buttons - more compact */
    .chart-tab-btn {
      padding: 0.3125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      border: none;
      background: transparent;
      border-radius: 0.25rem;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      flex: 1;                 /* Equal width */
      text-align: center;
      min-width: 4.25rem;      /* Smaller minimum width */
    }
    
    /* Chart tab hover state */
    .chart-tab-btn:hover {
      color: #4f46e5;
      background-color: #f3f4f6;
    }
    
    /* Chart tab active state - more pronounced */
    .chart-tab-btn.active {
      color: #4f46e5;
      background-color: #e0e7ff;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(79, 70, 229, 0.25);
    }
    
    /* ============ CHART PANELS ============ */
    .chart-panel {
      display: none;
      padding: 1rem 0;
    }
    
    .chart-panel.active {
      display: block;
      animation: fadeIn 0.2s ease-in-out;
    }
    
    /* Simple fade-in animation for panel switching */
    @keyframes fadeIn {
      from { opacity: 0.8; }
      to { opacity: 1; }
    }
    
    /* ============ FORM CONTROLS ============ */
    /* Add subtle hover effect to inputs */
    input[type="number"]:hover,
    select:hover,
    :global(input[type="text"]:hover),
    :global(input[type="color"]:hover) {
      border-color: #cbd5e1;
    }
    
    /* Consistent focus states */
    input:focus,
    select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }
  </style>