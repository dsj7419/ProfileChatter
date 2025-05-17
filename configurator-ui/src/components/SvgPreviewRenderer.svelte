<script>
    import { onMount, onDestroy } from 'svelte';
    import { 
      userConfig, 
      workStartDate, 
      chatMessages, 
      editableTheme,
      getPreviewConfiguration 
    } from '../stores/configStore.js';
    
    // State for SVG preview
    let generatedSvgMarkup = '';
    let isLoading = false;
    let error = null;
    let previewServer = 'http://localhost:3001';
    
    // State for copy button
    let isCopying = false;
    let copyButtonText = "Copy SVG Markup";
    
    // Add a manual toggle for tracking refreshes
    let manualRefreshCount = 0;
    
    // Add a mode toggle (light/dark)
    let previewMode = 'light'; // Default to light mode
    
    // Reference to the SVG container div
    let svgContainerDiv;
    
    // Content hash for tracking non-theme changes
    let prevContentHash = '';
    let prevThemeHash = '';
    
    // Flag to track if we've loaded configuration from the server
    let configLoaded = false;
    
    // Preview sizing options - GitHub README column widths
    let previewSizes = [
      { id: 'mobile', name: 'Mobile', width: 360 },
      { id: 'github-s', name: 'GitHub Small', width: 490 },
      { id: 'github-m', name: 'GitHub Medium', width: 670 },
      { id: 'github-l', name: 'GitHub Large', width: 850 },
      { id: 'custom', name: 'Custom', width: 320 }
    ];
    // Default to GitHub Medium size for optimal visibility
    let selectedSizeId = 'github-m';
    let customWidth = 320;
    
    $: currentPreviewWidth = previewSizes.find(s => s.id === selectedSizeId)?.width || customWidth;
    $: if (selectedSizeId === 'custom') currentPreviewWidth = customWidth;
    
    // Debug console output with timestamp
    function debug(message, data = null) {
      const timestamp = new Date().toISOString().substr(11, 12);
      console.log(`[SVG Preview ${timestamp}] ${message}`, data || '');
    }
    
    // Debounce function to prevent too many requests
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  
    // Copy SVG markup to clipboard
    async function copySvgMarkup() {
      if (!generatedSvgMarkup || isCopying) return;
      
      isCopying = true;
      copyButtonText = "Copying...";
      
      try {
        await navigator.clipboard.writeText(generatedSvgMarkup);
        copyButtonText = "Copied!";
        
        // Reset button text after 2 seconds
        setTimeout(() => {
          copyButtonText = "Copy SVG Markup";
          isCopying = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy SVG to clipboard:', err);
        copyButtonText = "Copy Failed";
        error = `Failed to copy to clipboard: ${err.message}`;
        
        // Reset button text after 2 seconds
        setTimeout(() => {
          copyButtonText = "Copy SVG Markup";
          isCopying = false;
        }, 2000);
      }
    }
    
    // Load initial configuration from server
    async function loadInitialConfig() {
      debug('Loading initial configuration from server');
      
      try {
        const response = await fetch(`${previewServer}/api/initial-config-data`);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        
        const configData = await response.json();
        debug('Received configuration data:', Object.keys(configData));
        
        // Here we could initialize our stores with the server data if needed
        // This is useful if we want to ensure we're always in sync with the server
        
        configLoaded = true;
        return true;
      } catch (err) {
        debug('Failed to load configuration from server:', err.message);
        error = `Failed to load configuration: ${err.message}`;
        return false;
      }
    }
    
    // Add a direct HTTP test function
    async function testServerConnection() {
      try {
        debug('Testing direct HTTP connection to preview server');
        const testResponse = await fetch(`${previewServer}/`, {
          method: 'GET'
        });
        
        if (testResponse.ok) {
          const text = await testResponse.text();
          debug('Server connection test successful', { status: testResponse.status });
          error = null; // Clear any previous errors
          return true;
        } else {
          debug('Server connection test failed', { status: testResponse.status });
          error = `Server connection failed: ${testResponse.status} ${testResponse.statusText}`;
          return false;
        }
      } catch (err) {
        debug('Server connection test threw an error', { error: err.message });
        error = `Cannot connect to preview server at ${previewServer}: ${err.message}`;
        return false;
      }
    }
    
    // Fetch SVG from preview server
    async function fetchPreview() {
      debug('fetchPreview called - manual refresh count:', manualRefreshCount);
      
      if (isLoading) {
        debug('Already loading, request ignored');
        return;
      }
      
      // Ensure we have required data
      if (!$userConfig?.profile?.NAME) {
        debug('No profile data available yet, skipping request');
        error = "Profile data is missing or incomplete. Please fill in your profile information.";
        return;
      }
      
      if (!$chatMessages || $chatMessages.length === 0) {
        debug('No chat messages available yet, skipping request');
        error = "No chat messages available. Please add at least one message.";
        return;
      }
      
      isLoading = true;
      error = null; // Clear any previous errors
      manualRefreshCount++;
      
      try {
        // Get a complete configuration object using our helper function
        const fullConfigData = getPreviewConfiguration();
        
        debug('Sending request to server', {
          url: `${previewServer}/generate-preview`,
          activeTheme: fullConfigData.activeTheme,
          messagesCount: fullConfigData.chatMessages.length,
          avatarsEnabled: fullConfigData.avatars?.enabled,
          profileName: fullConfigData.profile.NAME, 
          hasThemeOverrides: !!fullConfigData.themeOverrides,
          timestamp: new Date().toISOString()
        });
        
        // Send POST request to preview server
        const response = await fetch(`${previewServer}/generate-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullConfigData)
        });
        
        debug('Received response', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('Content-Type'),
          timestamp: new Date().toISOString()
        });
        
        if (!response.ok) {
          let errorText = 'Failed to generate SVG preview';
          try {
            const errorData = await response.json();
            errorText = errorData.error || errorText;
          } catch (e) {
            // If not JSON, use status text
            errorText = `${errorText}: ${response.statusText}`;
          }
          throw new Error(errorText);
        }
        
        // Get SVG markup as text
        const svgText = await response.text();
        debug('Received SVG content', { 
          length: svgText.length,
          preview: svgText.substring(0, 100) + '...',
          timestamp: new Date().toISOString()
        });
        
        if (svgText && svgText.includes('<svg')) {
          generatedSvgMarkup = svgText;
          debug('Updated SVG preview successfully');
          
          // After setting the SVG markup, we'll apply theme styles in the next tick
          setTimeout(() => {
            applyThemeStyles();
          }, 10);
        } else {
          throw new Error('Received invalid SVG content from server');
        }
      } catch (err) {
        console.error('Error fetching SVG preview:', err);
        error = err.message;
        generatedSvgMarkup = ''; // Clear on error
      } finally {
        isLoading = false;
      }
    }
    
    // Function to apply theme styles to the SVG element dynamically
    function applyThemeStyles() {
      if (!svgContainerDiv || !generatedSvgMarkup) return;
      
      const svgElement = svgContainerDiv.querySelector('svg');
      if (!svgElement) {
        debug('SVG element not found in container');
        return;
      }
      
      debug('Applying theme styles to SVG element');
      
      // Apply base theme properties
      svgElement.style.setProperty('--me-bubble-color', $editableTheme.ME_BUBBLE_COLOR);
      svgElement.style.setProperty('--visitor-bubble-color', $editableTheme.VISITOR_BUBBLE_COLOR);
      svgElement.style.setProperty('--me-text-color', $editableTheme.ME_TEXT_COLOR);
      svgElement.style.setProperty('--visitor-text-color', $editableTheme.VISITOR_TEXT_COLOR);
      svgElement.style.setProperty('--background-light', $editableTheme.BACKGROUND_LIGHT);
      svgElement.style.setProperty('--background-dark', $editableTheme.BACKGROUND_DARK);
      svgElement.style.setProperty('--active-background', 
        previewMode === 'light' ? $editableTheme.BACKGROUND_LIGHT : $editableTheme.BACKGROUND_DARK
      );
      svgElement.style.setProperty('--bubble-radius-px', `${$editableTheme.BUBBLE_RADIUS_PX}px`);
      svgElement.style.setProperty('--font-family', $editableTheme.FONT_FAMILY);
      
      // Apply reaction properties
      svgElement.style.setProperty('--reaction-font-size-px', `${$editableTheme.REACTION_FONT_SIZE_PX}px`);
      svgElement.style.setProperty('--reaction-bg-color', $editableTheme.REACTION_BG_COLOR);
      svgElement.style.setProperty('--reaction-bg-opacity', $editableTheme.REACTION_BG_OPACITY);
      svgElement.style.setProperty('--reaction-text-color', $editableTheme.REACTION_TEXT_COLOR);
      svgElement.style.setProperty('--reaction-padding-x-px', `${$editableTheme.REACTION_PADDING_X_PX}px`);
      svgElement.style.setProperty('--reaction-padding-y-px', `${$editableTheme.REACTION_PADDING_Y_PX}px`);
      svgElement.style.setProperty('--reaction-border-radius-px', `${$editableTheme.REACTION_BORDER_RADIUS_PX}px`);
      svgElement.style.setProperty('--reaction-offset-y-px', `${$editableTheme.REACTION_OFFSET_Y_PX}px`);
      svgElement.style.setProperty('--reaction-offset-x-px', `${$editableTheme.REACTION_OFFSET_X_PX || 0}px`);
      
      // Apply animation properties if available
      if ($editableTheme.REACTION_ANIMATION_DURATION_SEC) {
        svgElement.style.setProperty('--reaction-animation-duration-sec', `${$editableTheme.REACTION_ANIMATION_DURATION_SEC}s`);
      }
      
      if ($editableTheme.REACTION_ANIMATION_DELAY_SEC) {
        svgElement.style.setProperty('--reaction-animation-delay-sec', `${$editableTheme.REACTION_ANIMATION_DELAY_SEC}s`);
      }
      
      // Apply chart styles
      const chartStyles = $editableTheme.CHART_STYLES;
      if (chartStyles) {
        // General chart properties
        svgElement.style.setProperty('--bar-default-color', chartStyles.BAR_DEFAULT_COLOR);
        svgElement.style.setProperty('--bar-track-color', chartStyles.BAR_TRACK_COLOR);
        svgElement.style.setProperty('--bar-corner-radius-px', `${chartStyles.BAR_CORNER_RADIUS_PX}px`);
        svgElement.style.setProperty('--bar-height-px', `${chartStyles.BAR_HEIGHT_PX}px`);
        svgElement.style.setProperty('--bar-spacing-px', `${chartStyles.BAR_SPACING_PX}px`);
        
        // Font properties
        svgElement.style.setProperty('--label-font-family', chartStyles.LABEL_FONT_FAMILY);
        svgElement.style.setProperty('--label-font-size-px', `${chartStyles.LABEL_FONT_SIZE_PX}px`);
        svgElement.style.setProperty('--value-text-font-family', chartStyles.VALUE_TEXT_FONT_FAMILY);
        svgElement.style.setProperty('--value-text-font-size-px', `${chartStyles.VALUE_TEXT_FONT_SIZE_PX}px`);
        svgElement.style.setProperty('--value-text-inside-color', chartStyles.VALUE_TEXT_INSIDE_COLOR);
        
        // Title properties
        svgElement.style.setProperty('--title-font-family', chartStyles.TITLE_FONT_FAMILY);
        svgElement.style.setProperty('--title-font-size-px', `${chartStyles.TITLE_FONT_SIZE_PX}px`);
        svgElement.style.setProperty('--title-line-height-multiplier', chartStyles.TITLE_LINE_HEIGHT_MULTIPLIER);
        svgElement.style.setProperty('--title-bottom-margin-px', `${chartStyles.TITLE_BOTTOM_MARGIN_PX}px`);
        
        // Padding
        svgElement.style.setProperty('--chart-padding-x-px', `${chartStyles.CHART_PADDING_X_PX}px`);
        svgElement.style.setProperty('--chart-padding-y-px', `${chartStyles.CHART_PADDING_Y_PX}px`);
        
        // Text colors
        svgElement.style.setProperty('--me-title-color', chartStyles.ME_TITLE_COLOR);
        svgElement.style.setProperty('--me-label-color', chartStyles.ME_LABEL_COLOR);
        svgElement.style.setProperty('--me-value-text-color', chartStyles.ME_VALUE_TEXT_COLOR);
        
        svgElement.style.setProperty('--visitor-title-color', chartStyles.VISITOR_TITLE_COLOR);
        svgElement.style.setProperty('--visitor-label-color', chartStyles.VISITOR_LABEL_COLOR);
        svgElement.style.setProperty('--visitor-value-text-color', chartStyles.VISITOR_VALUE_TEXT_COLOR);
        
        // Donut chart specific properties
        svgElement.style.setProperty('--donut-stroke-width-px', `${chartStyles.DONUT_STROKE_WIDTH_PX}px`);
        svgElement.style.setProperty('--donut-center-text-font-size-px', `${chartStyles.DONUT_CENTER_TEXT_FONT_SIZE_PX}px`);
        svgElement.style.setProperty('--donut-center-text-font-family', chartStyles.DONUT_CENTER_TEXT_FONT_FAMILY);
        svgElement.style.setProperty('--me-donut-center-text-color', chartStyles.ME_DONUT_CENTER_TEXT_COLOR);
        svgElement.style.setProperty('--visitor-donut-center-text-color', chartStyles.VISITOR_DONUT_CENTER_TEXT_COLOR);
        svgElement.style.setProperty('--me-donut-legend-text-color', chartStyles.ME_DONUT_LEGEND_TEXT_COLOR);
        svgElement.style.setProperty('--visitor-donut-legend-text-color', chartStyles.VISITOR_DONUT_LEGEND_TEXT_COLOR);
        svgElement.style.setProperty('--donut-legend-font-size-px', `${chartStyles.DONUT_LEGEND_FONT_SIZE_PX}px`);
        svgElement.style.setProperty('--donut-legend-item-spacing-px', `${chartStyles.DONUT_LEGEND_ITEM_SPACING_PX}px`);
        svgElement.style.setProperty('--donut-legend-marker-size-px', `${chartStyles.DONUT_LEGEND_MARKER_SIZE_PX}px`);
        svgElement.style.setProperty('--donut-animation-duration-sec', `${chartStyles.DONUT_ANIMATION_DURATION_SEC}s`);
        svgElement.style.setProperty('--donut-segment-animation-delay-sec', `${chartStyles.DONUT_SEGMENT_ANIMATION_DELAY_SEC}s`);
        
        // Axis and grid colors
        svgElement.style.setProperty('--axis-line-color', chartStyles.AXIS_LINE_COLOR);
        svgElement.style.setProperty('--grid-line-color', chartStyles.GRID_LINE_COLOR);
        
        // Chart animation settings
        // First check chart-specific settings
        if (chartStyles.BAR_ANIMATION_DURATION_SEC) {
          svgElement.style.setProperty('--chart-bar-animation-duration-sec', `${chartStyles.BAR_ANIMATION_DURATION_SEC}s`);
        }
        else if (chartStyles.CHART_BAR_ANIMATION_DURATION_SEC) {
          svgElement.style.setProperty('--chart-bar-animation-duration-sec', `${chartStyles.CHART_BAR_ANIMATION_DURATION_SEC}s`);
        }
        else {
          // Fallback to defaults
          svgElement.style.setProperty('--chart-bar-animation-duration-sec', '0.8s');
        }
        
        // Add animation delay properties
        if (chartStyles.CHART_ANIMATION_DELAY_SEC) {
          svgElement.style.setProperty('--chart-animation-delay-sec', `${chartStyles.CHART_ANIMATION_DELAY_SEC}s`);
        } else {
          // Fallback
          svgElement.style.setProperty('--chart-animation-delay-sec', '0.3s');
        }
      }
      
      debug('Theme styles applied to SVG element');
    }
    
    // Create debounced versions
    const debouncedFetchPreview = debounce(fetchPreview, 500);
    const debouncedApplyThemeStyles = debounce(applyThemeStyles, 200);
    
    // Initialize after component mounted
    onMount(async () => {
      debug('Component mounted');
      
      // First test server connection
      const connected = await testServerConnection();
      if (!connected) {
        debug('Server connection failed, will retry when requested');
        return;
      }
      
      // Try to load initial config from server
      await loadInitialConfig();
      
      // Initial fetch after a short delay to ensure stores are populated
      setTimeout(() => {
        debug('Attempting initial fetch', {
          hasProfile: !!$userConfig?.profile,
          chatMessagesCount: $chatMessages?.length || 0
        });
        fetchPreview();
      }, 1000);
    });
    
    // Cleanup on destroy
    onDestroy(() => {
      debug('Component destroyed, cleaning up');
      // Any cleanup needed
    });
    
    // Create a computed hash of the content/structure for change tracking
    function computeContentHash() {
      return JSON.stringify({
        profile: $userConfig.profile,
        avatars: $userConfig.avatars,
        work_start_date: $workStartDate,
        messages: $chatMessages,
        activeTheme: $userConfig.activeTheme // Include theme name to trigger refresh on theme change
      });
    }
    
    // Create a computed hash of just the theme settings for change tracking
    function computeThemeHash() {
      return JSON.stringify($editableTheme);
    }
    
    // Watch for content/structure changes (non-theme) and update SVG with server fetch
    $: {
      if ($userConfig && $chatMessages) { // Ensure stores are populated
        // Create a hash of just the content/structure parts that require server rendering
        const contentHash = computeContentHash();
        
        // Only fetch if content has changed AND there are messages
        if (contentHash !== prevContentHash && $chatMessages.length > 0) {
          debug('CONTENT CHANGED - Triggering server fetch for new SVG', { 
            contentChanged: true,
            oldHash: prevContentHash.substring(0, 20) + '...',
            newHash: contentHash.substring(0, 20) + '...'
          });
          prevContentHash = contentHash;
          debouncedFetchPreview();
        }
      }
    }
    
    // Watch for theme changes ONLY and apply style updates client-side
    $: {
      if ($editableTheme && svgContainerDiv && generatedSvgMarkup) {
        const themeHash = computeThemeHash();
        if (themeHash !== prevThemeHash) {
          debug('THEME ONLY CHANGED - Applying styles client-side', {
            themeId: $userConfig.activeTheme
          });
          prevThemeHash = themeHash;
          debouncedApplyThemeStyles();
        }
      }
    }
    
    // Handle size change
    function handleSizeChange(event) {
      selectedSizeId = event.target.value;
      debug('Preview size changed', { size: selectedSizeId, width: currentPreviewWidth });
    }
    
    // Toggle between light and dark mode
    function setPreviewMode(mode) {
      if (mode === previewMode) return; // Already in that mode
      
      previewMode = mode;
      debug(`Switching to ${mode} mode`);
      
      if (svgContainerDiv && generatedSvgMarkup) {
        const svgElement = svgContainerDiv.querySelector('svg');
        if (svgElement) {
          // Update background directly
          svgElement.style.setProperty('--active-background', 
            mode === 'light' ? $editableTheme.BACKGROUND_LIGHT : $editableTheme.BACKGROUND_DARK
          );
          
          // Add a class to the SVG for additional styling if needed
          if (mode === 'dark') {
            svgElement.classList.add('dark-mode');
            svgElement.classList.remove('light-mode');
          } else {
            svgElement.classList.add('light-mode');
            svgElement.classList.remove('dark-mode');
          }
        }
      }
    }
    
    // Handle custom width change
    function applyCustomWidth() {
      if (customWidth >= 280 && customWidth <= 1200) {
        selectedSizeId = 'custom';
        debug('Custom width applied', { width: customWidth });
      }
    }
  </script>
  
  <div class="svg-preview-container">
    <div class="preview-controls">
      <div class="button-row">
        <button 
          class="refresh-button" 
          on:click={fetchPreview} 
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="loading-spinner"></span> Refreshing...
          {:else}
            Refresh Preview
          {/if}
        </button>
        
        <button
          class="test-button"
          on:click={testServerConnection}
          disabled={isLoading}
        >
          Test Connection
        </button>
      </div>
      
      <div class="size-controls">
        <label for="preview-size" class="size-label">Preview Size:</label>
        <select 
          id="preview-size" 
          class="size-select"
          bind:value={selectedSizeId}
          on:change={handleSizeChange}
        >
          {#each previewSizes as size}
            <option value={size.id}>{size.name} ({size.width}px)</option>
          {/each}
        </select>
        
        <!-- Dark Mode Toggle -->
        <div class="dark-mode-toggle">
          <span class="size-label mr-2" id="theme-mode-label">Theme Mode:</span>
          <div role="group" aria-labelledby="theme-mode-label">
            <button 
              class="mode-button {previewMode === 'light' ? 'active' : ''}"
              on:click={() => setPreviewMode('light')}
              aria-pressed={previewMode === 'light'}
            >
              Light
            </button>
            <button 
              class="mode-button {previewMode === 'dark' ? 'active' : ''}"
              on:click={() => setPreviewMode('dark')}
              aria-pressed={previewMode === 'dark'}
            >
              Dark
            </button>
          </div>
        </div>
        
        {#if selectedSizeId === 'custom'}
          <div class="custom-size-control">
            <input 
              type="number" 
              class="custom-width-input"
              bind:value={customWidth}
              min="280"
              max="1200"
              placeholder="Width (px)"
            />
            <button 
              class="apply-button"
              on:click={applyCustomWidth}
            >
              Apply
            </button>
          </div>
        {/if}
      </div>
      
      {#if error}
        <div class="error-message">
          <span>Error: {error}</span>
        </div>
      {/if}
      
      <!-- Debug info with added avatar status -->
      <div class="debug-info">
        <span>Server: {previewServer}</span>
        <span>Theme: {$userConfig?.activeTheme || 'none'}</span>
        <span>Mode: {previewMode}</span>
        <span>Messages: {$chatMessages?.length || 0}</span>
        <span>Avatars: {$userConfig?.avatars?.enabled ? 'Enabled' : 'Disabled'} ({$userConfig?.avatars?.shape || 'N/A'})</span>
        <span>Profile: {$userConfig?.profile?.NAME}</span>
        <span>Refreshes: {manualRefreshCount}</span>
      </div>
    </div>
    
    <!-- SVG wrapper to improve responsive display with width: 100% -->
    <div class="svg-wrapper" style="max-width: {currentPreviewWidth}px; width: 100%; margin: 0 auto;" bind:this={svgContainerDiv}>
      {#if isLoading && !generatedSvgMarkup}
        <div class="loading-indicator">
          <div class="spinner"></div>
          <span>Generating SVG preview...</span>
        </div>
      {:else if generatedSvgMarkup}
        <div class="svg-content">
          {@html generatedSvgMarkup}
        </div>
      {:else if !error}
        <div class="empty-state">
          <p>No preview available. Configure your profile and chat messages, then click "Refresh Preview".</p>
        </div>
      {/if}
      
      {#if generatedSvgMarkup}
        <div class="preview-note mt-4 text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded">
          <p>Your changes are automatically reflected in this preview. If you need to manually update, click "Refresh Preview".</p>
        </div>
      {/if}
    </div>
    
    <!-- Copy SVG Markup button -->
    {#if generatedSvgMarkup}
      <div class="copy-button-container">
        <button 
          class="copy-button" 
          on:click={copySvgMarkup} 
          disabled={isCopying || !generatedSvgMarkup}
        >
          {copyButtonText}
        </button>
      </div>
    {/if}
  </div>
  
  <style>
    .svg-preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      overflow: auto;
    }
    
    .preview-controls {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .button-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .refresh-button, .test-button, .apply-button {
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
    
    .test-button {
      background-color: #059669;
    }
    
    .test-button:hover {
      background-color: #047857;
    }
    
    .refresh-button:hover {
      background-color: #4338ca;
    }
    
    .refresh-button:disabled, .test-button:disabled, .apply-button:disabled {
      background-color: #6b7280;
      cursor: not-allowed;
    }
    
    .size-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    
    .size-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #4b5563;
      min-width: 100px;
    }
    
    .size-select {
      padding: 0.375rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #374151;
      background-color: white;
      min-width: 200px;
    }
    
    .custom-size-control {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.5rem;
      width: 100%;
    }
    
    .custom-width-input {
      padding: 0.375rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #374151;
      width: 100px;
    }
    
    .apply-button {
      background-color: #4f46e5;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
    
    .error-message {
      background-color: #fee2e2;
      color: #b91c1c;
      padding: 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    
    .debug-info {
      background-color: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      color: #4b5563;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .svg-wrapper {
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: max-width 0.3s ease;
      margin-bottom: 1rem;
    }
    
    .svg-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: auto;
    }
    
    .loading-indicator {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #6b7280;
      gap: 1rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .empty-state {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }
    
    /* Copy button styling */
    .copy-button-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .copy-button {
      background-color: #10b981;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .copy-button:hover {
      background-color: #059669;
    }
    
    .copy-button:disabled {
      background-color: #6b7280;
      cursor: not-allowed;
    }
    
    .preview-note {
      margin-top: 1rem;
      font-size: 0.75rem;
      color: #6b7280;
      padding: 0.5rem;
      background-color: #f3f4f6;
      border-radius: 0.375rem;
      width: 100%;
      text-align: center;
    }
    
    .mode-button {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      border: 1px solid #d1d5db;
      background-color: #f9fafb;
      color: #4b5563;
      transition: all 0.2s ease;
    }
    
    .mode-button:first-of-type {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }
    
    .mode-button:last-of-type {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
    
    .mode-button.active {
      background-color: #4f46e5;
      color: white;
      border-color: #4f46e5;
    }
    
    .dark-mode-toggle {
      display: flex;
      align-items: center;
      margin-top: 0.5rem;
    }
    
    .mr-2 {
      margin-right: 0.5rem;
    }
    
    :global(.svg-wrapper svg) {
      width: 100%;
      height: auto;
      max-width: 100%;
    }
  </style>