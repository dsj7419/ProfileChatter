<script>
    import { onMount, onDestroy } from 'svelte';
    import { 
      userConfig, 
      workStartDate, 
      chatMessages, 
      editableTheme,
      getPreviewConfiguration,
      previewMode
    } from '../stores/configStore.js';
    import { getPreviewToken } from '../lib/previewToken.js';
    
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
    
    // Add a mode toggle (light/dark) - initialized from system preference, but use store value
    // Reactive alias used throughout template and code
    $: mode = $previewMode;
    
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
    
    // Client-side scroll speed control
    let originalScrollDurationSec = null;
    
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
    
    // Capture scroll duration from SVG
    function captureOriginalScrollDuration() {
      if (!svgContainerDiv || !generatedSvgMarkup) return;
      
      const trackElement = svgContainerDiv.querySelector('svg .track');
      if (!trackElement) {
        debug('No .track element found in SVG');
        return;
      }
      
      const computedStyle = getComputedStyle(trackElement);
      const durationString = trackElement.style.animationDuration || computedStyle.animationDuration || '';
      
      // Parse duration string (e.g. "5.2s") to get numeric value
      const duration = parseFloat(durationString);
      
      if (!isNaN(duration) && duration > 0) {
        originalScrollDurationSec = duration;
        debug('Captured original scroll duration', { duration });
      } else {
        debug('Could not parse animation duration', { durationString });
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
        
        // Add more detailed logging
        debug('Sending request to server', {
          url: `${previewServer}/generate-preview`,
          activeTheme: fullConfigData.activeTheme,
          messagesCount: fullConfigData.chatMessages.length,
          avatarsEnabled: fullConfigData.avatars?.enabled,
          profileName: fullConfigData.profile.NAME,
          profileFields: Object.keys(fullConfigData.profile),
          hasThemeOverrides: !!fullConfigData.themeOverrides,
          timestamp: new Date().toISOString()
        });
        
        // Send POST request to preview server
        const token = await getPreviewToken(previewServer);
        const response = await fetch(`${previewServer}/generate-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Preview-Token': token
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
            setPreviewMode($previewMode);
            captureOriginalScrollDuration(); // Capture original scroll duration after SVG is in DOM
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
        $previewMode === 'light' ? $editableTheme.BACKGROUND_LIGHT : $editableTheme.BACKGROUND_DARK
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
    
    // Reactive block for client-side scroll speed adjustment
    $: {
      const multiplier = $userConfig?.layout?.ANIMATION?.SCROLL_SPEED_MULTIPLIER;
      if (originalScrollDurationSec !== null && svgContainerDiv && multiplier > 0) {
        const trackElement = svgContainerDiv.querySelector('svg .track');
        if (trackElement) {
          // Calculate new duration based on original and multiplier
          const newDuration = Math.max(0.1, originalScrollDurationSec / multiplier);
          
          // Only update if value has changed
          if (parseFloat(trackElement.style.animationDuration) !== newDuration) {
            trackElement.style.animationDuration = `${newDuration}s`;
            
            // Force animation restart for immediate effect
            const currentAnimationName = getComputedStyle(trackElement).animationName || 'scrollUp';
            trackElement.style.animationName = 'none';
            void trackElement.offsetWidth; // Force reflow
            trackElement.style.animationName = currentAnimationName;
            
            debug('Scroll speed adjusted', { originalDuration: originalScrollDurationSec, multiplier, newDuration });
          }
        }
      }
    }
    
    // Create debounced versions
    const debouncedFetchPreview = debounce(fetchPreview, 500);
    const debouncedApplyThemeStyles = debounce(applyThemeStyles, 200);
    
    // Initialize after component mounted
    onMount(async () => {
      debug('Component mounted');
      
      // Initialize the previewMode store based on system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      previewMode.set(prefersDarkMode ? 'dark' : 'light');
      
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
      // No explicit unsubscribe needed when using $-prefix syntax
    });
    
    // Create a computed hash of the content/structure for change tracking
    function computeContentHash() {
        // Create a direct string representation of all profile fields to ensure any change is detected
        const profileString = $userConfig && $userConfig.profile ? 
            Object.entries($userConfig.profile).map(([key, val]) => `${key}:${val}`).join('|') 
            : '';
        
        // Include all other data that should trigger a refresh
        return JSON.stringify({
            profile: profileString, // Direct string representation of profile
            workStartDate: $workStartDate ? `${$workStartDate.year}-${$workStartDate.month}-${$workStartDate.day}` : '',
            chatMessages: $chatMessages.map(msg => msg.id), // Only need IDs to detect changes
            activeTheme: $userConfig.activeTheme,
            avatars: $userConfig.avatars ? $userConfig.avatars.enabled : false,
            // Include a version number to force refresh whenever the computeContentHash function changes
            hashVersion: 2 // Incremented to ensure profile changes always detected
        });
    }
    
    // Create a computed hash of just the theme settings for change tracking
    function computeThemeHash() {
      return JSON.stringify($editableTheme);
    }
    
    // Force initial preview generation when chat messages and config are ready
    let initialContentHashComputed = false;
    
    // Watch for content/structure changes (non-theme) and update SVG with server fetch
    $: {
        if ($userConfig && $chatMessages) {
            const contentHash = computeContentHash();
            
            // Log additional details for profile-related changes
            if ($userConfig.profile) {
                console.log('Profile content check:', { 
                    name: $userConfig.profile.NAME,
                    profession: $userConfig.profile.PROFESSION,
                    location: $userConfig.profile.LOCATION,
                    company: $userConfig.profile.COMPANY
                });
            }
            
            console.log('Content hash check:', { 
                changed: contentHash !== prevContentHash,
                profileName: $userConfig.profile.NAME,
                messagesCount: $chatMessages.length,
                initialCheck: !initialContentHashComputed
            });
            
            if ((contentHash !== prevContentHash && $chatMessages.length > 0) || !initialContentHashComputed) {
                debug('CONTENT CHANGED - Triggering server fetch for new SVG', { 
                    contentChanged: true,
                    profileName: $userConfig.profile.NAME,
                    oldHash: prevContentHash.substring(0, 20) + '...',
                    newHash: contentHash.substring(0, 20) + '...',
                    initialCheck: !initialContentHashComputed
                });
                prevContentHash = contentHash;
                initialContentHashComputed = true;
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
      // Update the global store
      previewMode.set(mode);
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
            svgElement.classList.add('dark-mode-preview');
            svgElement.classList.remove('light-mode-preview');
          } else {
            svgElement.classList.add('light-mode-preview');
            svgElement.classList.remove('dark-mode-preview');
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
      <!-- Primary controls row -->
      <div class="controls-row">
        <!-- Left controls: buttons -->
        <div class="button-group">
          <button 
            class="refresh-button" 
            on:click={fetchPreview} 
            disabled={isLoading}
          >
            {#if isLoading}
              <span class="loading-spinner"></span> Refreshing...
            {:else}
              Refresh
            {/if}
          </button>
          
          <button
            class="test-button"
            on:click={testServerConnection}
            disabled={isLoading}
          >
            Test
          </button>
        </div>
        
        <!-- Right: size selector with inline custom size -->
        <div class="size-controls">
          <label for="preview-size" class="size-label">Size:</label>
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
          
          {#if selectedSizeId === 'custom'}
            <div class="custom-size-inline">
              <input 
                type="number" 
                class="custom-width-input"
                bind:value={customWidth}
                min="280"
                max="1200"
                placeholder="Width"
              />
              <button class="apply-button" on:click={applyCustomWidth}>Apply</button>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Secondary row for mode toggle, debug and copy button -->
      <div class="controls-secondary-row">
        <!-- Light/Dark Mode toggle -->
        <div class="mode-toggle">
          <span class="mode-label" id="theme-mode-label">Mode:</span>
          <div role="group" aria-labelledby="theme-mode-label">
            <button 
              class="mode-button {$previewMode === 'light' ? 'active' : ''}"
              on:click={() => setPreviewMode('light')}
              aria-pressed={$previewMode === 'light'}
            >
              Light
            </button>
            <button 
              class="mode-button {$previewMode === 'dark' ? 'active' : ''}"
              on:click={() => setPreviewMode('dark')}
              aria-pressed={$previewMode === 'dark'}
            >
              Dark
            </button>
          </div>
        </div>
        
        <!-- Debug dropdown with vertical list -->
        <details class="debug-details-container">
          <summary class="debug-summary">Debug Info</summary>
          <div class="debug-details">
            <div class="debug-item"><span class="debug-label">Server:</span> {previewServer}</div>
            <div class="debug-item"><span class="debug-label">Theme:</span> {$userConfig?.activeTheme || 'none'}</div>
            <div class="debug-item"><span class="debug-label">Mode:</span> {$previewMode}</div>
            <div class="debug-item"><span class="debug-label">Messages:</span> {$chatMessages?.length || 0}</div>
            <div class="debug-item"><span class="debug-label">Avatars:</span> {$userConfig?.avatars?.enabled ? 'Enabled' : 'Disabled'} ({$userConfig?.avatars?.shape || 'N/A'})</div>
            <div class="debug-item"><span class="debug-label">Profile:</span> {$userConfig?.profile?.NAME}</div>
            <div class="debug-item"><span class="debug-label">Refreshes:</span> {manualRefreshCount}</div>
          </div>
        </details>
        
        <!-- Copy button moved to top row -->
        {#if generatedSvgMarkup}
          <button 
            class="copy-button" 
            on:click={copySvgMarkup} 
            disabled={isCopying || !generatedSvgMarkup}
          >
            {copyButtonText}
          </button>
        {/if}
      </div>
      
      {#if error}
        <div class="error-message">
          <span>Error: {error}</span>
        </div>
      {/if}
    </div>
      
    <!-- SVG wrapper with top alignment -->
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
          <p>No preview available. Configure your profile and chat messages, then click "Refresh".</p>
        </div>
      {/if}
    </div>
  </div>
    
  <style>
    .svg-preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      overflow: hidden; /* Prevent scrollbars */
    }
    
    .preview-controls {
      margin-bottom: 0.25rem;
    }
    
    .controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    
    .controls-secondary-row {
      display: flex;
      align-items: center;
      gap: 1rem; /* Gap between elements */
      margin-bottom: 0.25rem;
      flex-wrap: wrap; /* Allow wrapping on very small screens */
    }
    
    .button-group {
      display: flex;
      gap: 0.25rem;
      flex-shrink: 0;
    }
    
    .size-controls {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-grow: 1;
      white-space: nowrap;
    }
    
    .mode-toggle {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .refresh-button, .test-button, .apply-button {
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 0.8rem;
      height: 0.8rem;
      border: a2px solid rgba(255,255,255,0.3);
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
    
    .size-label, .mode-label {
      font-size: 0.7rem;
      font-weight: 500;
      color: #4b5563;
    }
    
    .size-select {
      padding: 0.15rem 0.25rem;
      border: 1px solid #d1d5db;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      color: #374151;
      background-color: white;
      min-width: 120px;
      max-width: 180px;
    }
    
    .custom-size-inline {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .custom-width-input {
      padding: 0.15rem 0.25rem;
      border: 1px solid #d1d5db;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      color: #374151;
      width: 60px;
    }
    
    .apply-button {
      background-color: #4f46e5;
      padding: 0.15rem 0.25rem;
      font-size: 0.7rem;
    }
    
    .debug-details-container {
      position: relative;
    }
    
    .debug-summary {
      font-size: 0.7rem;
      color: #6b7280;
      cursor: pointer;
      user-select: none;
    }
    
    .debug-details {
      background-color: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.65rem;
      color: #4b5563;
      display: flex;
      flex-direction: column; /* Display as vertical list */
      gap: 0.25rem; /* Space between items */
      margin-top: 0.25rem;
      position: absolute;
      z-index: 10;
      left: 0; /* Align with the left of the details element */
      top: 100%; /* Position below the summary */
      white-space: nowrap;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      width: max-content;
      max-width: 90vw; /* Prevent going off-screen */
    }
    
    .debug-item {
      display: flex;
      align-items: center;
      line-height: 1.4;
    }
    
    .debug-label {
      font-weight: 500;
      margin-right: 0.25rem;
      min-width: 3.5rem; /* Ensure consistent alignment */
    }
    
    .error-message {
      background-color: #fee2e2;
      color: #b91c1c;
      padding: 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }
    
    .svg-wrapper {
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      padding: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start; /* Push content to top */
      align-items: center;
      transition: max-width 0.3s ease;
      min-height: 150px; /* Ensure minimum height */
    }
    
    .svg-content {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start; /* Push content to top */
      overflow: auto;
    }
    
    .loading-indicator {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding-top: 2rem;
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
      padding-top: 3rem;
    }
    
    /* Copy button styling */
    .copy-button {
      background-color: #10b981;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.25rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-left: auto; /* Push to the right */
    }
    
    .copy-button:hover {
      background-color: #059669;
    }
    
    .copy-button:disabled {
      background-color: #6b7280;
      cursor: not-allowed;
    }
    
    .mode-button {
      padding: 0.15rem 0.25rem;
      font-size: 0.7rem;
      border: 1px solid #d1d5db;
      background-color: #f9fafb;
      color: #4b5563;
      transition: all 0.2s ease;
    }
    
    .mode-button:first-of-type {
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }
    
    .mode-button:last-of-type {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
    
    .mode-button.active {
      background-color: #4f46e5;
      color: white;
      border-color: #4f46e5;
    }
    
    :global(.svg-wrapper svg) {
      width: 100%;
      height: auto;
      max-width: 100%;
      margin-top: 0;
    }
  </style>