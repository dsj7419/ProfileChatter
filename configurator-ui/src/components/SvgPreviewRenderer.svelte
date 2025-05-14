<script>
    import { onMount } from 'svelte';
    import { userConfig, workStartDate, chatMessages } from '../stores/configStore.js';
    
    // State for SVG preview
    let generatedSvgMarkup = '';
    let isLoading = false;
    let error = null;
    let previewServer = 'http://localhost:3001';
    
    // State for copy button
    let isCopying = false;
    let copyButtonText = "Copy SVG Markup";
    
    // Add a manual toggle for testing
    let manualRefreshCount = 0;
    
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
    
    // Debug console output
    function debug(message, data = null) {
      console.log(`[SVG Preview] ${message}`, data || '');
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
          return true;
        } else {
          debug('Server connection test failed', { status: testResponse.status });
          error = `Server connection failed: ${testResponse.status} ${testResponse.statusText}`;
          return false;
        }
      } catch (err) {
        debug('Server connection test threw an error', { error: err.message });
        error = `Cannot connect to preview server: ${err.message}`;
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
      
      if (!$userConfig?.profile?.NAME) {
        debug('No profile data available yet, skipping request');
        return;
      }
      
      if (!$chatMessages || $chatMessages.length === 0) {
        debug('No chat messages available yet, skipping request');
        return;
      }
      
      isLoading = true;
      error = null;
      manualRefreshCount++;
      
      try {
        // Prepare data for POST request
        const fullConfigData = { 
          profile: {
            ...$userConfig.profile,
            // Store date components explicitly
            WORK_START_DATE: {
              year: $workStartDate.year,
              month: $workStartDate.month,
              day: $workStartDate.day
            }
          },
          activeTheme: $userConfig.activeTheme,
          avatars: $userConfig.avatars, // Include avatar configuration
          chatMessages: $chatMessages
        };
        
        debug('Sending request to server', {
          url: `${previewServer}/generate-preview`,
          activeTheme: fullConfigData.activeTheme,
          messagesCount: fullConfigData.chatMessages.length,
          avatarsEnabled: fullConfigData.avatars?.enabled,
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
    
    // Create debounced version of fetchPreview with 500ms delay
    // We've verified this is an effective debounce time that balances
    // responsiveness with preventing excessive server calls
    const debouncedFetchPreview = debounce(fetchPreview, 500);
    
    // Initialize after component mounted
    onMount(() => {
      debug('Component mounted');
      // Test server connection first
      testServerConnection().then(connected => {
        if (connected) {
          debug('Server connection verified, attempting initial fetch');
          // Allow time for stores to be populated
          setTimeout(() => {
            debug('Attempting initial fetch', {
              hasProfile: !!$userConfig?.profile,
              chatMessagesCount: $chatMessages?.length || 0
            });
            fetchPreview();
          }, 1000);
        }
      });
    });
    
    // Watch for store changes and update SVG with debounced fetch
    $: {
      if ($userConfig && $chatMessages && $chatMessages.length > 0) {
        debug('Stores updated, triggering debounced preview');
        debouncedFetchPreview();
      }
    }
    
    // Handle size change
    function handleSizeChange(event) {
      selectedSizeId = event.target.value;
      debug('Preview size changed', { size: selectedSizeId, width: currentPreviewWidth });
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
            Refreshing...
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
        <span>Messages: {$chatMessages?.length || 0}</span>
        <span>Avatars: {$userConfig?.avatars?.enabled ? 'Enabled' : 'Disabled'} ({$userConfig?.avatars?.shape || 'N/A'})</span>
        <span>Profile: {$userConfig?.profile?.NAME}</span>
        <span>Refreshes: {manualRefreshCount}</span>
      </div>
    </div>
    
    <!-- SVG wrapper to improve responsive display with width: 100% -->
    <div class="svg-wrapper" style="max-width: {currentPreviewWidth}px; width: 100%; margin: 0 auto;">
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
    
    :global(.svg-wrapper svg) {
      width: 100%;
      height: auto;
      max-width: 100%;
    }
  </style>