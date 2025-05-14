<script>
    import { fade, slide } from 'svelte/transition';
    import { userConfig, workStartDate, chatMessages } from '../stores/configStore.js';
    
    // Reference for file input
    let fileInput;
    // State for loading status
    let isLoading = false;
    // State for showing the upload section
    let showUploadSection = false;
    // State for showing success message
    let showSuccess = false;
    // Success/error message
    let message = '';
    let isError = false;
    // Export format selection
    let exportFormat = 'json'; // Default format: 'json' or 'js'
  
    /**
     * Download the configuration in the selected format
     */
    function downloadConfiguration() {
      try {
        // Create a configuration object with all data from various stores
        const configData = { 
          profile: {
            ...$userConfig.profile,
            // Store date components explicitly
            WORK_START_DATE: {
              year: $workStartDate.year,
              month: $workStartDate.month, // 1-indexed as it is in the store
              day: $workStartDate.day
            }
          },
          activeTheme: $userConfig.activeTheme,
          avatars: $userConfig.avatars, // Include avatar settings
          chatMessages: $chatMessages
        };
        
        if (exportFormat === 'json') {
          // JSON Format
          const jsonString = JSON.stringify(configData, null, 2);
          downloadFile(jsonString, 'profileChatterConfig.json', 'application/json');
        } else {
          // JavaScript Module Format
          const jsContent = `// ProfileChatter Custom Configuration
  // Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  // This file can be used to customize your ProfileChatter configuration
  
  export const customUserSelections = {
    profile: ${JSON.stringify(configData.profile, null, 2)},
    activeTheme: "${configData.activeTheme}",
    avatars: ${JSON.stringify(configData.avatars, null, 2)}
  };
  
  // Note: This file does not include chat messages. For a complete backup including messages,
  // use the JSON export format instead.
  
  // To use this configuration:
  // 1. Save this file in your ProfileChatter project
  // 2. Import the customUserSelections in your config.js
  // 3. Merge into your main config:
  //    export const config = {
  //      ...originalConfig,
  //      profile: { ...originalConfig.profile, ...customUserSelections.profile },
  //      activeTheme: customUserSelections.activeTheme || originalConfig.activeTheme,
  //      avatars: { ...originalConfig.avatars, ...customUserSelections.avatars },
  //    };
  `;
          downloadFile(jsContent, 'profileChatter.custom.js', 'application/javascript');
        }
      } catch (err) {
        console.error('Error downloading configuration:', err);
        showStatusMessage(`Error downloading configuration: ${err.message}`, true);
      }
    }
    
    /**
     * Helper function for downloading files
     * @param {string} content - File content
     * @param {string} filename - Download filename
     * @param {string} contentType - MIME type
     */
    function downloadFile(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showStatusMessage(`Configuration exported as ${filename}`, false);
      }, 100);
    }
    
    /**
     * Toggle the upload section visibility
     */
    function toggleUploadSection() {
      showUploadSection = !showUploadSection;
    }
    
    /**
     * Trigger the hidden file input
     */
    function openFileInput() {
      fileInput.click();
    }
    
    /**
     * Show a status message to the user
     * @param {string} msg - The message to display
     * @param {boolean} error - Whether this is an error message
     */
    function showStatusMessage(msg, error = false) {
      message = msg;
      isError = error;
      showSuccess = true;
      
      // Auto-hide the message after 4 seconds
      setTimeout(() => {
        showSuccess = false;
      }, 4000);
    }
    
    /**
     * Handle file selection for uploading configuration
     * @param {Event} event - The change event from file input
     */
    async function loadConfigurationFromFile(event) {
      try {
        isLoading = true;
        
        // Get the selected file
        const file = event.target.files[0];
        
        // Check if a file was selected
        if (!file) {
          isLoading = false;
          return;
        }
        
        // Validate file type (basic check)
        if (!file.name.endsWith('.json') && file.type !== 'application/json') {
          showStatusMessage('Please select a valid JSON file.', true);
          fileInput.value = null; // Reset file input
          isLoading = false;
          return;
        }
        
        // Read the file content
        const fileContent = await readFileAsText(file);
        
        // Parse JSON
        let parsedData;
        try {
          parsedData = JSON.parse(fileContent);
        } catch (parseError) {
          showStatusMessage('Invalid JSON file. The file could not be parsed.', true);
          console.error('JSON parsing error:', parseError);
          fileInput.value = null; // Reset file input
          isLoading = false;
          return;
        }
        
        // Validate the structure of the parsed data
        if (!validateConfigStructure(parsedData)) {
          fileInput.value = null; // Reset file input
          isLoading = false;
          return;
        }
        
        // Update the stores with the validated data
        updateStoresFromConfig(parsedData);
        
        // Show success message
        showStatusMessage('Configuration loaded successfully!');
        
        // Reset file input
        fileInput.value = null;
        isLoading = false;
        
        // Automatically hide the upload section after successful load
        showUploadSection = false;
      } catch (err) {
        console.error('Error loading configuration:', err);
        showStatusMessage(`Error loading configuration: ${err.message}`, true);
        fileInput.value = null; // Reset file input
        isLoading = false;
      }
    }
    
    /**
     * Validate the structure of the loaded configuration
     * @param {Object} data - The parsed configuration data
     * @returns {boolean} - Whether the structure is valid
     */
    function validateConfigStructure(data) {
      // Check for required top-level keys
      if (!data || typeof data !== 'object') {
        showStatusMessage('Invalid configuration: Not a valid object.', true);
        return false;
      }
      
      // Check if this is an array of messages (legacy format)
      if (Array.isArray(data)) {
        // Validate as array of messages
        for (let i = 0; i < data.length; i++) {
          const msg = data[i];
          if (!msg.id || !msg.sender || (msg.sender !== 'me' && msg.sender !== 'visitor')) {
            showStatusMessage(`Invalid chat data: Message at index ${i} has invalid structure.`, true);
            return false;
          }
        }
        
        // Legacy format is valid - will only update chat messages
        showStatusMessage('Note: This file only contains chat messages, not profile settings.', false);
        
        // Create a wrapper object with only chatMessages
        data = { chatMessages: data };
        return true;
      }
      
      // For comprehensive config, validate profile if present
      if (data.profile && typeof data.profile === 'object') {
        // Check required profile fields
        const requiredProfileFields = ['NAME', 'PROFESSION', 'LOCATION', 'COMPANY', 'GITHUB_USERNAME'];
        for (const field of requiredProfileFields) {
          if (!data.profile[field]) {
            showStatusMessage(`Invalid configuration: Missing required profile field "${field}".`, true);
            return false;
          }
        }
        
        // Check work start date if present
        if (data.profile.WORK_START_DATE && 
            typeof data.profile.WORK_START_DATE === 'object') {
          if (!data.profile.WORK_START_DATE.year ||
              !data.profile.WORK_START_DATE.month ||
              !data.profile.WORK_START_DATE.day) {
            showStatusMessage('Invalid configuration: Missing or invalid WORK_START_DATE components.', true);
            return false;
          }
        }
      }
      
      // Check theme if present
      if (data.activeTheme !== undefined && typeof data.activeTheme !== 'string') {
        showStatusMessage('Invalid configuration: activeTheme must be a string.', true);
        return false;
      }
      
      // Check avatars if present
      if (data.avatars && typeof data.avatars === 'object') {
        if (typeof data.avatars.enabled !== 'boolean') {
          showStatusMessage('Invalid configuration: avatars.enabled must be a boolean.', true);
          return false;
        }
        
        // Check me and visitor avatar objects 
        if (data.avatars.me && typeof data.avatars.me !== 'object') {
          showStatusMessage('Invalid configuration: avatars.me must be an object.', true);
          return false;
        }
        
        if (data.avatars.visitor && typeof data.avatars.visitor !== 'object') {
          showStatusMessage('Invalid configuration: avatars.visitor must be an object.', true);
          return false;
        }
        
        // Validate shape value if present
        if (data.avatars.shape && !['circle', 'square'].includes(data.avatars.shape)) {
          showStatusMessage('Invalid configuration: avatars.shape must be "circle" or "square".', true);
          return false;
        }
      }
      
      // Check chat messages if present
      if (data.chatMessages !== undefined) {
        if (!Array.isArray(data.chatMessages)) {
          showStatusMessage('Invalid configuration: chatMessages is not an array.', true);
          return false;
        }
        
        // Check message structure (basic validation)
        for (let i = 0; i < data.chatMessages.length; i++) {
          const msg = data.chatMessages[i];
          if (!msg.id || !msg.sender || (msg.sender !== 'me' && msg.sender !== 'visitor')) {
            showStatusMessage(`Invalid configuration: Message at index ${i} has invalid structure.`, true);
            return false;
          }
        }
      }
      
      return true;
    }
    
    /**
     * Update all stores with data from the parsed configuration
     * @param {Object} data - The validated configuration data
     */
    function updateStoresFromConfig(data) {
      // Update profile, theme, and avatars if present
      if (data.profile || data.activeTheme || data.avatars) {
        userConfig.update(currentConfig => {
          const newConfig = { ...currentConfig };
          
          // Update profile if present
          if (data.profile) {
            // Extract work start date to handle separately
            const { WORK_START_DATE, ...profileWithoutDate } = data.profile;
            
            // Update profile
            newConfig.profile = {
              ...currentConfig.profile,
              ...profileWithoutDate
            };
            
            // Update work start date if present
            if (WORK_START_DATE) {
              workStartDate.set(WORK_START_DATE);
            }
          }
          
          // Update theme if present
          if (data.activeTheme) {
            newConfig.activeTheme = data.activeTheme;
          }
          
          // Update avatars if present
          if (data.avatars) {
            newConfig.avatars = {
              ...currentConfig.avatars,
              ...data.avatars
            };
          }
          
          return newConfig;
        });
      }
      
      // Update chat messages if present
      if (data.chatMessages) {
        chatMessages.set(data.chatMessages);
      }
    }
    
    /**
     * Read a file as text using FileReader with Promise
     * @param {File} file - The file to read
     * @returns {Promise<string>} - Promise resolving to file content
     */
    function readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = event => {
          resolve(event.target.result);
        };
        
        reader.onerror = error => {
          reject(error);
        };
        
        reader.readAsText(file);
      });
    }
  </script>
  
  <div class="p-3 border border-gray-200 rounded-md bg-white">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Configuration Management</h3>
    
    <!-- Export Format Selection -->
    <div class="pb-2 mb-3 border-b border-gray-200">
      <h4 class="text-xs font-medium text-gray-500 uppercase mb-2">Export Format</h4>
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input type="radio" bind:group={exportFormat} value="json" class="mr-1 text-primary focus:ring-primary">
          <span class="text-sm">JSON</span>
          <span class="ml-1 text-xs text-gray-500">(Complete Backup)</span>
        </label>
        <label class="flex items-center">
          <input type="radio" bind:group={exportFormat} value="js" class="mr-1 text-primary focus:ring-primary">
          <span class="text-sm">JavaScript</span>
          <span class="ml-1 text-xs text-gray-500">(Profile Only)</span>
        </label>
      </div>
    </div>
    
    <div class="space-y-3">
      <!-- Download Configuration Button -->
      <button 
        type="button"
        on:click={downloadConfiguration}
        class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Download Configuration
      </button>
      
      <!-- Toggle Upload Section Button -->
      <button 
        type="button"
        on:click={toggleUploadSection}
        class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
        {showUploadSection ? 'Hide Upload Section' : 'Upload Configuration'}
      </button>
      
      <!-- Upload Section (Expandable) -->
      {#if showUploadSection}
        <div class="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 transition-all" transition:slide={{ duration: 300 }}>
          <p class="text-xs text-gray-600 mb-3">
            Select a JSON configuration file to restore your saved settings.
          </p>
          
          <div class="flex flex-col space-y-2">
            <!-- Hidden File Input -->
            <input 
              type="file" 
              accept=".json" 
              bind:this={fileInput} 
              on:change={loadConfigurationFromFile} 
              class="hidden"
            />
            
            <!-- Styled File Selection Button -->
            <button 
              type="button"
              on:click={openFileInput}
              class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {#if isLoading}
                <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                Processing...
              {:else}
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                Select Configuration File
              {/if}
            </button>
            
            <p class="text-xs text-gray-500 mt-1">
              Note: Only JSON files can be imported. JavaScript module files are for export only.
            </p>
          </div>
        </div>
      {/if}
      
      <!-- Success/Error Message -->
      {#if showSuccess}
        <div 
          class="mt-2 p-2 rounded-md text-sm transition-opacity duration-300"
          class:bg-green-100={!isError}
          class:text-green-800={!isError}
          class:bg-red-100={isError}
          class:text-red-800={isError}
          transition:fade={{ duration: 200 }}
        >
          {message}
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    /* Button transition styling */
    button {
      transition: transform 0.1s ease-in-out, background-color 0.2s ease;
    }
    
    button:active {
      transform: scale(0.98);
    }
  </style>