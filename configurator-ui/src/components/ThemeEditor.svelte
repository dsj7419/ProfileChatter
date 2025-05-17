<script>
    import { onMount } from 'svelte';
    import { editableTheme, fontOptions } from '../stores/configStore.js';
    
    // Tab state for top-level categories
    let activeTab = 'general';
    
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
    
    // After component is mounted, initialize the chart tabs
    onMount(() => {
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        // Chart sub-navigation tab functionality
        const chartTabs = document.querySelectorAll('.chart-tab-btn');
        const chartPanels = document.querySelectorAll('.chart-panel');
        
        console.log('Chart tabs initialization:', {
          tabsFound: chartTabs.length,
          panelsFound: chartPanels.length
        });
        
        // Set initial active state
        if (chartTabs.length > 0 && chartPanels.length > 0) {
          chartTabs[0].classList.add('active');
          chartPanels[0].classList.add('active');
        }
        
        // Add click handlers
        chartTabs.forEach(tab => {
          tab.addEventListener('click', () => {
            // Remove active class from all tabs and panels
            chartTabs.forEach(t => t.classList.remove('active'));
            chartPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding panel
            const targetId = `chart-${tab.dataset.target}`;
            const targetPanel = document.getElementById(targetId);
            console.log('Tab clicked:', tab.dataset.target, 'Target panel:', targetId);
            
            if (targetPanel) {
              targetPanel.classList.add('active');
            } else {
              console.warn('Target panel not found:', targetId);
            }
          });
        });
      }, 100); // Short delay to ensure DOM is ready
    });
  </script>
  
  <div class="theme-editor p-3 border border-gray-200 rounded-md bg-white">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Theme Editor</h3>
    
    <!-- Main Tab Navigation -->
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
        Chat Bubbles
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
        <!-- Background Colors -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Background Colors</h4>
          
          <!-- BACKGROUND_LIGHT -->
          <div class="mb-3">
            <label for="bg-light" class="block text-xs font-medium text-gray-500 mb-1">Light Background</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="bg-light" 
                bind:value={$editableTheme.BACKGROUND_LIGHT} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.BACKGROUND_LIGHT} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <!-- BACKGROUND_DARK -->
          <div>
            <label for="bg-dark" class="block text-xs font-medium text-gray-500 mb-1">Dark Background</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="bg-dark" 
                bind:value={$editableTheme.BACKGROUND_DARK} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.BACKGROUND_DARK} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>
        
        <!-- Typography -->
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
      </div>
    {/if}
    
    <!-- Chat Bubbles Tab -->
    {#if activeTab === 'bubbles'}
      <div class="theme-panel space-y-4">
        <!-- Message Bubble Appearance -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Bubble Appearance</h4>
          
          <!-- BUBBLE_RADIUS_PX -->
          <div class="mb-3">
            <label for="bubble-radius" class="block text-xs font-medium text-gray-500 mb-1">Corner Radius (px)</label>
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
          <div class="mb-3">
            <label for="me-bubble-color" class="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="me-bubble-color" 
                bind:value={$editableTheme.ME_BUBBLE_COLOR} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.ME_BUBBLE_COLOR} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <!-- ME_TEXT_COLOR -->
          <div>
            <label for="me-text-color" class="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="me-text-color" 
                bind:value={$editableTheme.ME_TEXT_COLOR} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.ME_TEXT_COLOR} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>
        
        <!-- Visitor Bubbles -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Visitor Bubbles</h4>
          
          <!-- VISITOR_BUBBLE_COLOR -->
          <div class="mb-3">
            <label for="visitor-bubble-color" class="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="visitor-bubble-color" 
                bind:value={$editableTheme.VISITOR_BUBBLE_COLOR} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.VISITOR_BUBBLE_COLOR} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <!-- VISITOR_TEXT_COLOR -->
          <div>
            <label for="visitor-text-color" class="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="visitor-text-color" 
                bind:value={$editableTheme.VISITOR_TEXT_COLOR} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.VISITOR_TEXT_COLOR} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Reactions Tab -->
    {#if activeTab === 'reactions'}
      <div class="theme-panel space-y-4">
        <!-- Reaction Appearance -->
        <div class="section">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Appearance</h4>
          
          <!-- REACTION_BG_COLOR -->
          <div class="mb-3">
            <label for="reaction-bg-color" class="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="reaction-bg-color" 
                bind:value={$editableTheme.REACTION_BG_COLOR} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.REACTION_BG_COLOR} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <!-- REACTION_BG_OPACITY -->
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
          
          <!-- REACTION_TEXT_COLOR -->
          <div class="mb-3">
            <label for="reaction-text-color" class="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
            <div class="flex gap-2">
              <input 
                type="color" 
                id="reaction-text-color" 
                bind:value={$editableTheme.REACTION_TEXT_COLOR} 
                class="h-8 w-8 rounded border border-gray-300"
              />
              <input 
                type="text" 
                bind:value={$editableTheme.REACTION_TEXT_COLOR} 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <!-- REACTION_BORDER_RADIUS_PX -->
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
          
          <!-- REACTION_FONT_SIZE_PX -->
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
          
          <!-- REACTION_PADDING_X_PX -->
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
          
          <!-- REACTION_PADDING_Y_PX -->
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
        </div>
        
        <!-- Reaction Positioning -->
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
        
        <!-- Reaction Animation -->
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
      </div>
    {/if}
    
    <!-- Charts Tab with Sub-navigation -->
    {#if activeTab === 'charts'}
      <!-- Chart Sub-navigation -->
      <div class="charts-subnav flex mb-4">
        <div class="flex overflow-x-auto py-1 bg-gray-50 rounded-md w-full">
          <button class="chart-tab-btn active" data-target="general">General</button>
          <button class="chart-tab-btn" data-target="bar">Bar Charts</button>
          <button class="chart-tab-btn" data-target="donut">Donut Charts</button>
        </div>
      </div>
      
      <!-- General Chart Settings -->
      <div class="chart-panel active" id="chart-general">
        <div class="space-y-4">
          <!-- Common Styling -->
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
          
          <!-- Grid & Axis -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Grid & Axis</h4>
            
            <!-- AXIS_LINE_COLOR -->
            <div class="mb-3">
              <label for="axis-line-color" class="block text-xs font-medium text-gray-500 mb-1">Axis Line Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="axis-line-color" 
                  bind:value={$editableTheme.CHART_STYLES.AXIS_LINE_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.AXIS_LINE_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- GRID_LINE_COLOR -->
            <div>
              <label for="grid-line-color" class="block text-xs font-medium text-gray-500 mb-1">Grid Line Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="grid-line-color" 
                  bind:value={$editableTheme.CHART_STYLES.GRID_LINE_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.GRID_LINE_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>
          
          <!-- Common Typography -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Typography</h4>
            
            <!-- Title Settings -->
            <div class="mb-4">
              <h5 class="text-xs font-medium text-gray-500 mb-2">Chart Titles</h5>
              
              <!-- TITLE_FONT_FAMILY -->
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
              
              <!-- TITLE_FONT_SIZE_PX -->
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
              
              <!-- TITLE_LINE_HEIGHT_MULTIPLIER -->
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
              
              <!-- TITLE_BOTTOM_MARGIN_PX -->
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
            </div>
            
            <!-- Labels Settings -->
            <div class="mb-4">
              <h5 class="text-xs font-medium text-gray-500 mb-2">Chart Labels</h5>
              
              <!-- LABEL_FONT_FAMILY -->
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
              
              <!-- LABEL_FONT_SIZE_PX -->
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
              
              <!-- VALUE_TEXT_FONT_FAMILY -->
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
              
              <!-- VALUE_TEXT_FONT_SIZE_PX -->
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
              
              <!-- VALUE_TEXT_INSIDE_COLOR -->
              <div>
                <label for="value-text-inside-color" class="block text-xs font-medium text-gray-500 mb-1">Inside Text Color</label>
                <div class="flex gap-2">
                  <input 
                    type="color" 
                    id="value-text-inside-color" 
                    bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_INSIDE_COLOR} 
                    class="h-8 w-8 rounded border border-gray-300"
                  />
                  <input 
                    type="text" 
                    bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_INSIDE_COLOR} 
                    class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- User-specific Colors (Me) -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">User Colors (Me)</h4>
            
            <!-- ME_TITLE_COLOR -->
            <div class="mb-3">
              <label for="me-title-color" class="block text-xs font-medium text-gray-500 mb-1">Title Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="me-title-color" 
                  bind:value={$editableTheme.CHART_STYLES.ME_TITLE_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.ME_TITLE_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- ME_LABEL_COLOR -->
            <div class="mb-3">
              <label for="me-label-color" class="block text-xs font-medium text-gray-500 mb-1">Label Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="me-label-color" 
                  bind:value={$editableTheme.CHART_STYLES.ME_LABEL_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.ME_LABEL_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- ME_VALUE_TEXT_COLOR -->
            <div>
              <label for="me-value-text-color" class="block text-xs font-medium text-gray-500 mb-1">Value Text Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="me-value-text-color" 
                  bind:value={$editableTheme.CHART_STYLES.ME_VALUE_TEXT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.ME_VALUE_TEXT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>
          
          <!-- Visitor-specific Colors -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Visitor Colors</h4>
            
            <!-- VISITOR_TITLE_COLOR -->
            <div class="mb-3">
              <label for="visitor-title-color" class="block text-xs font-medium text-gray-500 mb-1">Title Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="visitor-title-color" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_TITLE_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_TITLE_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- VISITOR_LABEL_COLOR -->
            <div class="mb-3">
              <label for="visitor-label-color" class="block text-xs font-medium text-gray-500 mb-1">Label Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="visitor-label-color" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_LABEL_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_LABEL_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- VISITOR_VALUE_TEXT_COLOR -->
            <div>
              <label for="visitor-value-text-color" class="block text-xs font-medium text-gray-500 mb-1">Value Text Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="visitor-value-text-color" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_VALUE_TEXT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_VALUE_TEXT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>
          
          <!-- Chart Animation -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Animation (All Charts)</h4>
            
            <!-- CHART_BAR_ANIMATION_DURATION_SEC -->
            <div class="mb-3">
              <label for="chart-animation-duration" class="block text-xs font-medium text-gray-500 mb-1">Animation Duration (sec)</label>
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
            
            <!-- CHART_ANIMATION_DELAY_SEC -->
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
          </div>
        </div>
      </div>
      
      <!-- Bar Chart Settings -->
      <div class="chart-panel" id="chart-bar">
        <div class="space-y-4">
          <!-- Bar Appearance -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Bar Appearance</h4>
            
            <!-- BAR_DEFAULT_COLOR -->
            <div class="mb-3">
              <label for="bar-default-color" class="block text-xs font-medium text-gray-500 mb-1">Default Bar Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="bar-default-color" 
                  bind:value={$editableTheme.CHART_STYLES.BAR_DEFAULT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.BAR_DEFAULT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- BAR_TRACK_COLOR -->
            <div class="mb-3">
              <label for="bar-track-color" class="block text-xs font-medium text-gray-500 mb-1">Track Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="bar-track-color" 
                  bind:value={$editableTheme.CHART_STYLES.BAR_TRACK_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.BAR_TRACK_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- BAR_CORNER_RADIUS_PX -->
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
            
            <!-- BAR_HEIGHT_PX -->
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
            
            <!-- BAR_SPACING_PX -->
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
          </div>
          
          <!-- Bar Animation -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Bar Animation</h4>
            
            <!-- BAR_ANIMATION_DURATION_SEC (if not in general) -->
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
        </div>
      </div>
      
      <!-- Donut Chart Settings -->
      <div class="chart-panel" id="chart-donut">
        <div class="space-y-4">
          <!-- Donut Appearance -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Donut Appearance</h4>
            
            <!-- DONUT_STROKE_WIDTH_PX -->
            <div>
              <label for="donut-stroke-width" class="block text-xs font-medium text-gray-500 mb-1">Stroke Width (px)</label>
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
            
            <!-- DONUT_CENTER_TEXT_FONT_FAMILY -->
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
            
            <!-- DONUT_CENTER_TEXT_FONT_SIZE_PX -->
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
            
            <!-- ME_DONUT_CENTER_TEXT_COLOR -->
            <div class="mb-3">
              <label for="me-donut-center-text-color" class="block text-xs font-medium text-gray-500 mb-1">Me Text Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="me-donut-center-text-color" 
                  bind:value={$editableTheme.CHART_STYLES.ME_DONUT_CENTER_TEXT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.ME_DONUT_CENTER_TEXT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- VISITOR_DONUT_CENTER_TEXT_COLOR -->
            <div>
              <label for="visitor-donut-center-text-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Text Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="visitor-donut-center-text-color" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_DONUT_CENTER_TEXT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_DONUT_CENTER_TEXT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>
          
          <!-- Donut Legend -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Legend</h4>
            
            <!-- DONUT_LEGEND_FONT_SIZE_PX -->
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
            
            <!-- ME_DONUT_LEGEND_TEXT_COLOR -->
            <div class="mb-3">
              <label for="me-donut-legend-text-color" class="block text-xs font-medium text-gray-500 mb-1">Me Legend Text Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="me-donut-legend-text-color" 
                  bind:value={$editableTheme.CHART_STYLES.ME_DONUT_LEGEND_TEXT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.ME_DONUT_LEGEND_TEXT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <!-- VISITOR_DONUT_LEGEND_TEXT_COLOR -->
            <div class="mb-3">
              <label for="visitor-donut-legend-text-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Legend Text Color</label>
              <div class="flex gap-2">
                <input 
                  type="color" 
                  id="visitor-donut-legend-text-color" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_DONUT_LEGEND_TEXT_COLOR} 
                  class="h-8 w-8 rounded border border-gray-300"
                />
                <input 
                  type="text" 
                  bind:value={$editableTheme.CHART_STYLES.VISITOR_DONUT_LEGEND_TEXT_COLOR} 
                  class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
            
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
          </div>
          
          <!-- Donut Animation -->
          <div class="section">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Animation</h4>
            
            <!-- DONUT_ANIMATION_DURATION_SEC -->
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
            
            <!-- DONUT_SEGMENT_ANIMATION_DELAY_SEC -->
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
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .theme-tabs {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; /* Firefox */
    }
    
    .theme-tabs::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Edge */
    }
    
    .section {
      padding: 1rem;
      border: 1px solid #f0f0f0;
      border-radius: 0.375rem;
      background-color: #fafafa;
    }
    
    .charts-subnav {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; /* Firefox */
    }
    
    .charts-subnav::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Edge */
    }
    
    .chart-tab-btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      border: none;
      background: transparent;
      border-radius: 0.25rem;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    
    .chart-tab-btn:hover {
      color: #4f46e5;
      background-color: #f3f4f6;
    }
    
    .chart-tab-btn.active {
      color: #4f46e5;
      background-color: #e0e7ff;
    }
    
    .chart-panel {
      display: none;
      padding: 1rem 0;
    }
    
    .chart-panel.active {
      display: block;
    }
  </style>