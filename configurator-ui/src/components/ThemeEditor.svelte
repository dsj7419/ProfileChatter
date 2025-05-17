<script>
    import { editableTheme } from '../stores/configStore.js';
  </script>
  
  <div class="p-3 border border-gray-200 rounded-md bg-white">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Theme Editor</h3>
  
    <!-- General Styles Section -->
    <details open class="mb-4">
      <summary class="font-medium text-sm mb-2 cursor-pointer">General Styles</summary>
      <div class="space-y-3 pl-2">
        <!-- ME_BUBBLE_COLOR -->
        <div>
          <label for="me-bubble-color" class="block text-xs font-medium text-gray-500 mb-1">Me Bubble Color</label>
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
        
        <!-- VISITOR_BUBBLE_COLOR -->
        <div>
          <label for="visitor-bubble-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Bubble Color</label>
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
        
        <!-- ME_TEXT_COLOR -->
        <div>
          <label for="me-text-color" class="block text-xs font-medium text-gray-500 mb-1">Me Text Color</label>
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
        
        <!-- VISITOR_TEXT_COLOR -->
        <div>
          <label for="visitor-text-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Text Color</label>
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
        
        <!-- BACKGROUND_LIGHT -->
        <div>
          <label for="bg-light" class="block text-xs font-medium text-gray-500 mb-1">Background Light</label>
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
          <label for="bg-dark" class="block text-xs font-medium text-gray-500 mb-1">Background Dark</label>
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
        
        <!-- BUBBLE_RADIUS_PX -->
        <div>
          <label for="bubble-radius" class="block text-xs font-medium text-gray-500 mb-1">Bubble Radius (px)</label>
          <input 
            type="number" 
            id="bubble-radius" 
            bind:value={$editableTheme.BUBBLE_RADIUS_PX} 
            min="0"
            max="30"
            class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
        
        <!-- FONT_FAMILY -->
        <div>
            <label for="font-family" class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
            <select 
            id="font-family" 
            bind:value={$editableTheme.FONT_FAMILY} 
            class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            >
            <option value="'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">System Default (SF Pro/San Francisco)</option>
            <option value="'Arial', sans-serif" style="font-family: Arial, sans-serif">Arial</option>
            <option value="'Helvetica', sans-serif" style="font-family: Helvetica, sans-serif">Helvetica</option>
            <option value="'Verdana', sans-serif" style="font-family: Verdana, sans-serif">Verdana</option>
            <option value="'Trebuchet MS', sans-serif" style="font-family: 'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="'Roboto', sans-serif" style="font-family: Roboto, sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif" style="font-family: 'Open Sans', sans-serif">Open Sans</option>
            <option value="'Times New Roman', serif" style="font-family: 'Times New Roman', serif">Times New Roman</option>
            <option value="'Georgia', serif" style="font-family: Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace" style="font-family: 'Courier New', monospace">Courier New</option>
            </select>
        </div>
      </div>
    </details>
  
    <!-- Reaction Styles Section -->
    <details class="mb-4">
      <summary class="font-medium text-sm mb-2 cursor-pointer">Reaction Styles</summary>
      <div class="space-y-3 pl-2">
        <!-- REACTION_FONT_SIZE_PX -->
        <div>
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
        
        <!-- REACTION_BG_COLOR -->
        <div>
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
        <div>
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
        <div>
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
        
        <!-- REACTION_PADDING_X_PX -->
        <div>
          <label for="reaction-padding-x" class="block text-xs font-medium text-gray-500 mb-1">Padding X (px)</label>
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
          <label for="reaction-padding-y" class="block text-xs font-medium text-gray-500 mb-1">Padding Y (px)</label>
          <input 
            type="number" 
            id="reaction-padding-y" 
            bind:value={$editableTheme.REACTION_PADDING_Y_PX} 
            min="0"
            max="20"
            class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          />
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
        
        <!-- REACTION_OFFSET_X_PX -->
        <div>
          <label for="reaction-offset-x" class="block text-xs font-medium text-gray-500 mb-1">Offset X (px)</label>
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
          <label for="reaction-offset-y" class="block text-xs font-medium text-gray-500 mb-1">Offset Y (px)</label>
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
    </details>
  
    <!-- Chart Styles Section -->
    <details class="mb-4">
      <summary class="font-medium text-sm mb-2 cursor-pointer">Chart Styles</summary>
      
      <!-- Common Chart Properties -->
      <details class="mb-3 pl-2">
        <summary class="text-xs font-medium text-gray-600 mb-2 cursor-pointer">Common Chart Properties</summary>
        <div class="space-y-3 pl-2">
          <!-- CHART_PADDING_X_PX -->
          <div>
            <label for="chart-padding-x" class="block text-xs font-medium text-gray-500 mb-1">Chart Padding X (px)</label>
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
            <label for="chart-padding-y" class="block text-xs font-medium text-gray-500 mb-1">Chart Padding Y (px)</label>
            <input 
              type="number" 
              id="chart-padding-y" 
              bind:value={$editableTheme.CHART_STYLES.CHART_PADDING_Y_PX} 
              min="0"
              max="50"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <!-- AXIS_LINE_COLOR -->
          <div>
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
      </details>
      
      <!-- Bar Chart Specific -->
      <details class="mb-3 pl-2">
        <summary class="text-xs font-medium text-gray-600 mb-2 cursor-pointer">Bar Chart Specific</summary>
        <div class="space-y-3 pl-2">
          <!-- BAR_DEFAULT_COLOR -->
          <div>
            <label for="bar-default-color" class="block text-xs font-medium text-gray-500 mb-1">Bar Default Color</label>
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
          <div>
            <label for="bar-track-color" class="block text-xs font-medium text-gray-500 mb-1">Bar Track Color</label>
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
            <label for="bar-corner-radius" class="block text-xs font-medium text-gray-500 mb-1">Bar Corner Radius (px)</label>
            <input 
              type="number" 
              id="bar-corner-radius" 
              bind:value={$editableTheme.CHART_STYLES.BAR_CORNER_RADIUS_PX} 
              min="0"
              max="20"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <!-- BAR_HEIGHT_PX -->
          <div>
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
      </details>
      
      <!-- Donut Chart Specific -->
      <details class="mb-3 pl-2">
        <summary class="text-xs font-medium text-gray-600 mb-2 cursor-pointer">Donut Chart Specific</summary>
        <div class="space-y-3 pl-2">
          <!-- DONUT_STROKE_WIDTH_PX -->
          <div>
            <label for="donut-stroke-width" class="block text-xs font-medium text-gray-500 mb-1">Donut Stroke Width (px)</label>
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
          
          <!-- DONUT_ANIMATION_DURATION_SEC -->
          <div>
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
            <label for="donut-segment-delay" class="block text-xs font-medium text-gray-500 mb-1">Segment Animation Delay (sec)</label>
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
      </details>
      
      <!-- Chart Text Styles -->
      <details class="mb-3 pl-2">
        <summary class="text-xs font-medium text-gray-600 mb-2 cursor-pointer">Chart Text Styles</summary>
        <div class="space-y-3 pl-2">
          <!-- Font Families -->
          <div>
            <label for="label-font-family" class="block text-xs font-medium text-gray-500 mb-1">Label Font Family</label>
            <input 
              type="text" 
              id="label-font-family" 
              bind:value={$editableTheme.CHART_STYLES.LABEL_FONT_FAMILY} 
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="value-text-font-family" class="block text-xs font-medium text-gray-500 mb-1">Value Text Font Family</label>
            <input 
              type="text" 
              id="value-text-font-family" 
              bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_FONT_FAMILY} 
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="title-font-family" class="block text-xs font-medium text-gray-500 mb-1">Title Font Family</label>
            <input 
              type="text" 
              id="title-font-family" 
              bind:value={$editableTheme.CHART_STYLES.TITLE_FONT_FAMILY} 
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="donut-center-text-font-family" class="block text-xs font-medium text-gray-500 mb-1">Donut Center Text Font Family</label>
            <input 
              type="text" 
              id="donut-center-text-font-family" 
              bind:value={$editableTheme.CHART_STYLES.DONUT_CENTER_TEXT_FONT_FAMILY} 
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <!-- Font Sizes -->
          <div>
            <label for="label-font-size" class="block text-xs font-medium text-gray-500 mb-1">Label Font Size (px)</label>
            <input 
              type="number" 
              id="label-font-size" 
              bind:value={$editableTheme.CHART_STYLES.LABEL_FONT_SIZE_PX} 
              min="8"
              max="24"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="value-text-font-size" class="block text-xs font-medium text-gray-500 mb-1">Value Text Font Size (px)</label>
            <input 
              type="number" 
              id="value-text-font-size" 
              bind:value={$editableTheme.CHART_STYLES.VALUE_TEXT_FONT_SIZE_PX} 
              min="8"
              max="24"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="title-font-size" class="block text-xs font-medium text-gray-500 mb-1">Title Font Size (px)</label>
            <input 
              type="number" 
              id="title-font-size" 
              bind:value={$editableTheme.CHART_STYLES.TITLE_FONT_SIZE_PX} 
              min="8"
              max="28"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="donut-center-text-font-size" class="block text-xs font-medium text-gray-500 mb-1">Donut Center Text Font Size (px)</label>
            <input 
              type="number" 
              id="donut-center-text-font-size" 
              bind:value={$editableTheme.CHART_STYLES.DONUT_CENTER_TEXT_FONT_SIZE_PX} 
              min="8"
              max="28"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <div>
            <label for="donut-legend-font-size" class="block text-xs font-medium text-gray-500 mb-1">Donut Legend Font Size (px)</label>
            <input 
              type="number" 
              id="donut-legend-font-size" 
              bind:value={$editableTheme.CHART_STYLES.DONUT_LEGEND_FONT_SIZE_PX} 
              min="8"
              max="24"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <!-- Other Text Properties -->
          <div>
            <label for="title-line-height" class="block text-xs font-medium text-gray-500 mb-1">Title Line Height Multiplier</label>
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
          
          <div>
            <label for="title-bottom-margin" class="block text-xs font-medium text-gray-500 mb-1">Title Bottom Margin (px)</label>
            <input 
              type="number" 
              id="title-bottom-margin" 
              bind:value={$editableTheme.CHART_STYLES.TITLE_BOTTOM_MARGIN_PX} 
              min="0"
              max="50"
              class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <!-- VALUE_TEXT_INSIDE_COLOR -->
          <div>
            <label for="value-text-inside-color" class="block text-xs font-medium text-gray-500 mb-1">Value Text Inside Color</label>
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
      </details>
      
      <!-- Chart Sender-Specific Colors -->
      <details class="mb-3 pl-2">
        <summary class="text-xs font-medium text-gray-600 mb-2 cursor-pointer">Chart Sender-Specific Colors</summary>
        <div class="space-y-3 pl-2">
          <!-- Me Colors -->
          <div>
            <label for="me-title-color" class="block text-xs font-medium text-gray-500 mb-1">Me Title Color</label>
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
          
          <div>
            <label for="me-label-color" class="block text-xs font-medium text-gray-500 mb-1">Me Label Color</label>
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
          
          <div>
            <label for="me-value-text-color" class="block text-xs font-medium text-gray-500 mb-1">Me Value Text Color</label>
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
          
          <div>
            <label for="me-donut-center-text-color" class="block text-xs font-medium text-gray-500 mb-1">Me Donut Center Text Color</label>
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
          
          <div>
            <label for="me-donut-legend-text-color" class="block text-xs font-medium text-gray-500 mb-1">Me Donut Legend Text Color</label>
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
          
          <!-- Visitor Colors -->
          <div>
            <label for="visitor-title-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Title Color</label>
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
          
          <div>
            <label for="visitor-label-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Label Color</label>
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
          
          <div>
            <label for="visitor-value-text-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Value Text Color</label>
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
          
          <div>
            <label for="visitor-donut-center-text-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Donut Center Text Color</label>
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
          
          <div>
            <label for="visitor-donut-legend-text-color" class="block text-xs font-medium text-gray-500 mb-1">Visitor Donut Legend Text Color</label>
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
        </div>
      </details>
      
      <!-- Chart Legend Styles (Donut) -->
      <details class="mb-3 pl-2">
        <summary class="text-xs font-medium text-gray-600 mb-2 cursor-pointer">Chart Legend Styles (Donut)</summary>
        <div class="space-y-3 pl-2">
          <!-- DONUT_LEGEND_ITEM_SPACING_PX -->
          <div>
            <label for="donut-legend-item-spacing" class="block text-xs font-medium text-gray-500 mb-1">Legend Item Spacing (px)</label>
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
            <label for="donut-legend-marker-size" class="block text-xs font-medium text-gray-500 mb-1">Legend Marker Size (px)</label>
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
      </details>
    </details>
  </div>