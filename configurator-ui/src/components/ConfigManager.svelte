<script>
    import { fade, slide } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { userConfig, workStartDate, chatMessages, editableTheme } from '../stores/configStore.js'
    import OAuthStatusDisplay from './OAuthStatusDisplay.svelte'
    import HelpIconTooltip from '../lib/ui/HelpIconTooltip.svelte'
  
    // Reference for file inputs
    let fileInput
    let specificPartFileInput
    // State for loading status
    let isLoading = false
    // State for showing the upload section
    let showUploadSection = false
    // State for showing success message
    let showSuccess = false
    // Success/error message
    let message = ''
    let isError = false
    // Export format selection
    let exportFormat = 'json' // Default format: 'json' or 'js'
    // Target for imports (messages, theme, profile, avatars)
    let importTarget = null
    // State for showing GitHub instructions
    let showGitHubInstructions = false
  
    // OAuth state management
    let oauthStatuses = {}
    const previewServer = 'http://localhost:3001'
  
    // Helper for capitalizing a string
    function cap(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    async function refreshOauthStatus() {
      try {
        const res = await fetch(`${previewServer}/oauth-status`)
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`)
        }
        oauthStatuses = await res.json()
      } catch (err) {
        console.error('Failed to fetch OAuth status:', err)
        oauthStatuses = {} // Empty object to handle gracefully in the UI
      }
    }
  
    function connectProvider(providerName) {
      window.location.href = `${previewServer}/auth/${providerName}`
    }
  
    onMount(() => {
      refreshOauthStatus()
      // Set up interval inside onMount to avoid issues with SSR and multiple instances
      const interval = setInterval(refreshOauthStatus, 60000)
      // Return cleanup function
      return () => clearInterval(interval)
    })
  
    /**
     * Show a status message to the user
     * @param {string} msg - The message to display
     * @param {boolean} error - Whether this is an error message
     */
    function showStatusMessage(msg, error = false) {
      message = msg
      isError = error
      showSuccess = true
  
      // Auto-hide the message after 4 seconds
      setTimeout(() => {
        showSuccess = false
      }, 4000)
    }
  
    /**
     * Helper function for downloading files
     * @param {string} content - File content
     * @param {string} filename - Download filename
     * @param {string} contentType - MIME type
     */
    function downloadFile(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
  
      document.body.appendChild(a)
      a.click()
  
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(a.href)
        showStatusMessage(`Configuration exported as ${filename}`, false)
      }, 100)
    }
  
    /**
     * Read a file as text using FileReader with Promise
     * @param {File} file - The file to read
     * @returns {Promise<string>} - Promise resolving to file content
     */
    function readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
  
        reader.onload = (event) => {
          resolve(event.target.result)
        }
  
        reader.onerror = (error) => {
          reject(error)
        }
  
        reader.readAsText(file)
      })
    }
  
    /**
     * Toggle the upload section visibility
     */
    function toggleUploadSection() {
      showUploadSection = !showUploadSection
    }
  
    /**
     * Trigger the hidden file input for full configuration import
     */
    function openFileInput() {
      fileInput.click()
    }
  
    /**
     * Trigger the hidden file input for specific part imports
     * @param {string} target - The type of component to import
     */
    function importSpecificPart(target) {
      importTarget = target
      specificPartFileInput.click()
    }
  
    /**
     * Generate config JSON and copy to clipboard for GitHub update
     */
    async function copyConfigForGitHub() {
      try {
        // Create a configuration object with all data from various stores
        const configData = {
          profile: {
            ...$userConfig.profile,
            WORK_START_DATE: {
              year: $workStartDate.year,
              month: $workStartDate.month,
              day: $workStartDate.day,
            },
          },
          activeTheme: $userConfig.activeTheme,
          avatars: $userConfig.avatars,
          chatMessages: $chatMessages,
          themeOverrides: $editableTheme,
          layoutAnimationOverrides: {
            SCROLL_SPEED_MULTIPLIER: $userConfig.layout?.ANIMATION?.SCROLL_SPEED_MULTIPLIER || 1.0,
          },
        }
  
        // Only include the override if it's different from the default
        if (configData.layoutAnimationOverrides.SCROLL_SPEED_MULTIPLIER === 1.0) {
          delete configData.layoutAnimationOverrides.SCROLL_SPEED_MULTIPLIER
        }
  
        if (Object.keys(configData.layoutAnimationOverrides).length === 0) {
          delete configData.layoutAnimationOverrides
        }
  
        // Generate JSON string with proper formatting
        const jsonString = JSON.stringify(configData, null, 2)
  
        // Copy to clipboard
        await navigator.clipboard.writeText(jsonString)
  
        // Show success message
        showStatusMessage(
          'Configuration copied to clipboard! Follow the instructions below to update GitHub.'
        )
  
        // Show GitHub instructions
        showGitHubInstructions = true
      } catch (err) {
        console.error('Error copying configuration to clipboard:', err)
        showStatusMessage(
          'Failed to copy to clipboard. Please try downloading the file instead.',
          true
        )
      }
    }
  
    /**
     * Dismiss the GitHub instructions panel
     */
    function dismissGitHubInstructions() {
      showGitHubInstructions = false
    }
    /**
     * Download the configuration in the selected format
     */
    function downloadConfiguration() {
      try {
        // Create a configuration object with all data from various stores
        const configData = {
          profile: {
            ...$userConfig.profile,
            WORK_START_DATE: {
              year: $workStartDate.year,
              month: $workStartDate.month,
              day: $workStartDate.day,
            },
          },
          activeTheme: $userConfig.activeTheme,
          avatars: $userConfig.avatars,
          chatMessages: $chatMessages,
          themeOverrides: $editableTheme,
          layoutAnimationOverrides: {
            SCROLL_SPEED_MULTIPLIER: $userConfig.layout?.ANIMATION?.SCROLL_SPEED_MULTIPLIER || 1.0,
          },
        }
  
        // Only include the override if it's different from the default
        if (configData.layoutAnimationOverrides.SCROLL_SPEED_MULTIPLIER === 1.0) {
          delete configData.layoutAnimationOverrides.SCROLL_SPEED_MULTIPLIER
        }
  
        if (Object.keys(configData.layoutAnimationOverrides).length === 0) {
          delete configData.layoutAnimationOverrides
        }
  
        if (exportFormat === 'json') {
          // JSON Format
          const jsonString = JSON.stringify(configData, null, 2)
          downloadFile(jsonString, 'profileChatterConfig.json', 'application/json')
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
              `
          downloadFile(jsContent, 'profileChatter.custom.js', 'application/javascript')
        }
      } catch (err) {
        console.error('Error downloading configuration:', err)
        showStatusMessage(`Error downloading configuration: ${err.message}`, true)
      }
    }
  
    /**
     * Export just the chat messages component
     */
    function exportChatMessages() {
      try {
        const jsonString = JSON.stringify($chatMessages, null, 2)
        downloadFile(jsonString, 'profileChatter_messages.json', 'application/json')
        showStatusMessage('Chat messages exported as profileChatter_messages.json')
      } catch (err) {
        console.error('Error exporting chat messages:', err)
        showStatusMessage(`Error exporting chat messages: ${err.message}`, true)
      }
    }
  
    /**
     * Export just the theme settings component
     */
    function exportThemeSettings() {
      try {
        const jsonString = JSON.stringify($editableTheme, null, 2)
        downloadFile(jsonString, 'profileChatter_theme.json', 'application/json')
        showStatusMessage('Theme settings exported as profileChatter_theme.json')
      } catch (err) {
        console.error('Error exporting theme settings:', err)
        showStatusMessage(`Error exporting theme settings: ${err.message}`, true)
      }
    }
  
    /**
     * Export just the profile data component
     */
    function exportProfileData() {
      try {
        const profileData = {
          profile: $userConfig.profile,
          workStartDate: {
            year: $workStartDate.year,
            month: $workStartDate.month,
            day: $workStartDate.day,
          },
        }
        const jsonString = JSON.stringify(profileData, null, 2)
        downloadFile(jsonString, 'profileChatter_profile.json', 'application/json')
        showStatusMessage('Profile data exported as profileChatter_profile.json')
      } catch (err) {
        console.error('Error exporting profile data:', err)
        showStatusMessage(`Error exporting profile data: ${err.message}`, true)
      }
    }
  
    /**
     * Export just the avatar settings component
     */
    function exportAvatarSettings() {
      try {
        const jsonString = JSON.stringify($userConfig.avatars, null, 2)
        downloadFile(jsonString, 'profileChatter_avatars.json', 'application/json')
        showStatusMessage('Avatar settings exported as profileChatter_avatars.json')
      } catch (err) {
        console.error('Error exporting avatar settings:', err)
        showStatusMessage(`Error exporting avatar settings: ${err.message}`, true)
      }
    }
  
    /**
     * Handle file selection for uploading configuration
     * @param {Event} event - The change event from file input
     */
    async function loadConfigurationFromFile(event) {
      try {
        isLoading = true
  
        // Get the selected file
        const file = event.target.files[0]
  
        // Check if a file was selected
        if (!file) {
          isLoading = false
          return
        }
  
        // Validate file type (basic check)
        if (!file.name.endsWith('.json') && file.type !== 'application/json') {
          showStatusMessage('Please select a valid JSON file.', true)
          fileInput.value = null // Reset file input
          isLoading = false
          return
        }
  
        // Read the file content
        const fileContent = await readFileAsText(file)
  
        // Parse JSON
        let parsedData
        try {
          parsedData = JSON.parse(fileContent)
        } catch (parseError) {
          showStatusMessage('Invalid JSON file. The file could not be parsed.', true)
          console.error('JSON parsing error:', parseError)
          fileInput.value = null // Reset file input
          isLoading = false
          return
        }
  
        // Validate the structure of the parsed data
        if (!validateConfigStructure(parsedData)) {
          fileInput.value = null // Reset file input
          isLoading = false
          return
        }
  
        // Update the stores with the validated data
        updateStoresFromConfig(parsedData)
  
        // Show success message
        showStatusMessage('Configuration loaded successfully!')
  
        // Reset file input
        fileInput.value = null
        isLoading = false
  
        // Automatically hide the upload section after successful load
        showUploadSection = false
      } catch (err) {
        console.error('Error loading configuration:', err)
        showStatusMessage(`Error loading configuration: ${err.message}`, true)
        fileInput.value = null // Reset file input
        isLoading = false
      }
    }
  
    /**
     * Handle file selection for uploading specific configuration parts
     * @param {Event} event - The change event from file input
     */
    async function loadSpecificPartFromFile(event) {
      if (!importTarget) {
        showStatusMessage('Import target not specified.', true)
        event.target.value = null
        return
      }
  
      try {
        isLoading = true
  
        // Get the selected file
        const file = event.target.files[0]
  
        // Check if a file was selected
        if (!file) {
          isLoading = false
          return
        }
  
        // Validate file type (basic check)
        if (!file.name.endsWith('.json') && file.type !== 'application/json') {
          showStatusMessage('Please select a valid JSON file.', true)
          event.target.value = null // Reset file input
          isLoading = false
          importTarget = null
          return
        }
  
        // Read the file content
        const fileContent = await readFileAsText(file)
  
        // Parse JSON
        let parsedData
        try {
          parsedData = JSON.parse(fileContent)
        } catch (parseError) {
          showStatusMessage('Invalid JSON file. The file could not be parsed.', true)
          console.error('JSON parsing error:', parseError)
          event.target.value = null // Reset file input
          isLoading = false
          importTarget = null
          return
        }
  
        // Process based on import target
        let success = false
  
        switch (importTarget) {
          case 'messages':
            success = importChatMessages(parsedData)
            break
          case 'theme':
            success = importThemeSettings(parsedData)
            break
          case 'profile':
            success = importProfileData(parsedData)
            break
          case 'avatars':
            success = importAvatarSettings(parsedData)
            break
          default:
            showStatusMessage(`Unknown import target: ${importTarget}`, true)
        }
  
        // Reset file input regardless of outcome
        event.target.value = null
        isLoading = false
        importTarget = null
      } catch (err) {
        console.error(`Error importing ${importTarget}:`, err)
        showStatusMessage(`Error importing ${importTarget}: ${err.message}`, true)
        event.target.value = null // Reset file input
        isLoading = false
        importTarget = null
      }
    }
  
    /**
     * Import chat messages from JSON
     * @param {Array|Object} data - Parsed data from JSON
     * @returns {boolean} Whether import was successful
     */
    function importChatMessages(data) {
      // Handle case where data is wrapped in an object with chatMessages property
      const messages = Array.isArray(data) ? data : data.chatMessages || null
  
      if (!messages || !Array.isArray(messages)) {
        showStatusMessage('Invalid format for chat messages. Expected an array.', true)
        return false
      }
  
      // Validate message structure
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        if (!msg.id || !msg.sender || (msg.sender !== 'me' && msg.sender !== 'visitor')) {
          showStatusMessage(`Invalid message at index ${i}. Missing required fields.`, true)
          return false
        }
      }
  
      // Update the store with validated messages
      chatMessages.set(messages)
      showStatusMessage('Chat messages imported successfully.')
      return true
    }
  
    /**
     * Import theme settings from JSON
     * @param {Object} data - Parsed data from JSON
     * @returns {boolean} Whether import was successful
     */
    function importThemeSettings(data) {
      // Handle case where theme is in themeOverrides property
      const themeData = data.themeOverrides || data
  
      if (!themeData || typeof themeData !== 'object') {
        showStatusMessage('Invalid format for theme settings. Expected an object.', true)
        return false
      }
  
      // Basic validation of theme structure
      const requiredThemeProperties = [
        'ME_BUBBLE_COLOR',
        'VISITOR_BUBBLE_COLOR',
        'ME_TEXT_COLOR',
        'VISITOR_TEXT_COLOR',
      ]
  
      for (const prop of requiredThemeProperties) {
        if (!themeData[prop]) {
          showStatusMessage(`Invalid theme settings. Missing required property: ${prop}.`, true)
          return false
        }
      }
  
      // Update the editable theme store
      editableTheme.set(themeData)
      showStatusMessage('Theme settings imported successfully.')
      return true
    }
  
    /**
     * Import profile data from JSON
     * @param {Object} data - Parsed data from JSON
     * @returns {boolean} Whether import was successful
     */
    function importProfileData(data) {
      if (!data || typeof data !== 'object') {
        showStatusMessage('Invalid format for profile data. Expected an object.', true)
        return false
      }
  
      // Check for profile object
      if (!data.profile || typeof data.profile !== 'object') {
        showStatusMessage('Invalid profile data. Missing profile object.', true)
        return false
      }
  
      // Check for required profile fields
      const requiredProfileFields = ['NAME', 'PROFESSION', 'LOCATION', 'COMPANY', 'GITHUB_USERNAME']
      for (const field of requiredProfileFields) {
        if (!data.profile[field]) {
          showStatusMessage(`Invalid profile data. Missing required field: ${field}.`, true)
          return false
        }
      }
  
      // Check for work start date
      const workDate = data.workStartDate || data.profile.WORK_START_DATE
      if (
        !workDate ||
        typeof workDate !== 'object' ||
        !workDate.year ||
        !workDate.month ||
        !workDate.day
      ) {
        showStatusMessage('Invalid profile data. Missing or invalid work start date.', true)
        return false
      }
  
      // Update profile in userConfig
      userConfig.update((cfg) => ({
        ...cfg,
        profile: {
          ...cfg.profile,
          ...data.profile,
        },
      }))
  
      // Update work start date
      workStartDate.set(workDate)
  
      showStatusMessage('Profile data imported successfully.')
      return true
    }
  
    /**
     * Import avatar settings from JSON
     * @param {Object} data - Parsed data from JSON
     * @returns {boolean} Whether import was successful
     */
    function importAvatarSettings(data) {
      // Handle case where avatars is a property in a larger object
      const avatarData = data.avatars || data
  
      if (!avatarData || typeof avatarData !== 'object') {
        showStatusMessage('Invalid format for avatar settings. Expected an object.', true)
        return false
      }
  
      // Basic validation of avatar structure
      if (typeof avatarData.enabled !== 'boolean') {
        showStatusMessage('Invalid avatar settings. Missing or invalid "enabled" property.', true)
        return false
      }
  
      if (
        !avatarData.me ||
        typeof avatarData.me !== 'object' ||
        !avatarData.visitor ||
        typeof avatarData.visitor !== 'object'
      ) {
        showStatusMessage(
          'Invalid avatar settings. Missing or invalid "me" or "visitor" properties.',
          true
        )
        return false
      }
  
      // Update avatars in userConfig
      userConfig.update((cfg) => ({
        ...cfg,
        avatars: {
          ...cfg.avatars,
          ...avatarData,
        },
      }))
  
      showStatusMessage('Avatar settings imported successfully.')
      return true
    }
  
    /**
     * Validate the structure of the loaded configuration
     * @param {Object} data - The parsed configuration data
     * @returns {boolean} - Whether the structure is valid
     */
    function validateConfigStructure(data) {
      // Check for required top-level keys
      if (!data || typeof data !== 'object') {
        showStatusMessage('Invalid configuration: Not a valid object.', true)
        return false
      }
  
      // Check if this is an array of messages (legacy format)
      if (Array.isArray(data)) {
        // Validate as array of messages
        for (let i = 0; i < data.length; i++) {
          const msg = data[i]
          if (!msg.id || !msg.sender || (msg.sender !== 'me' && msg.sender !== 'visitor')) {
            showStatusMessage(`Invalid chat data: Message at index ${i} has invalid structure.`, true)
            return false
          }
        }
  
        // Legacy format is valid - will only update chat messages
        showStatusMessage('Note: This file only contains chat messages, not profile settings.', false)
  
        // Create a wrapper object with only chatMessages
        data = { chatMessages: data }
        return true
      }
  
      // For comprehensive config, validate profile if present
      if (data.profile && typeof data.profile === 'object') {
        // Check required profile fields
        const requiredProfileFields = ['NAME', 'PROFESSION', 'LOCATION', 'COMPANY', 'GITHUB_USERNAME']
        for (const field of requiredProfileFields) {
          if (!data.profile[field]) {
            showStatusMessage(
              `Invalid configuration: Missing required profile field "${field}".`,
              true
            )
            return false
          }
        }
  
        // Check work start date if present
        if (data.profile.WORK_START_DATE && typeof data.profile.WORK_START_DATE === 'object') {
          if (
            !data.profile.WORK_START_DATE.year ||
            !data.profile.WORK_START_DATE.month ||
            !data.profile.WORK_START_DATE.day
          ) {
            showStatusMessage(
              'Invalid configuration: Missing or invalid WORK_START_DATE components.',
              true
            )
            return false
          }
        }
      }
  
      // Check theme if present
      if (data.activeTheme !== undefined && typeof data.activeTheme !== 'string') {
        showStatusMessage('Invalid configuration: activeTheme must be a string.', true)
        return false
      }
  
      // Check avatars if present
      if (data.avatars && typeof data.avatars === 'object') {
        if (typeof data.avatars.enabled !== 'boolean') {
          showStatusMessage('Invalid configuration: avatars.enabled must be a boolean.', true)
          return false
        }
  
        // Check me and visitor avatar objects
        if (data.avatars.me && typeof data.avatars.me !== 'object') {
          showStatusMessage('Invalid configuration: avatars.me must be an object.', true)
          return false
        }
  
        if (data.avatars.visitor && typeof data.avatars.visitor !== 'object') {
          showStatusMessage('Invalid configuration: avatars.visitor must be an object.', true)
          return false
        }
  
        // Validate shape value if present
        if (data.avatars.shape && !['circle', 'square'].includes(data.avatars.shape)) {
          showStatusMessage(
            'Invalid configuration: avatars.shape must be "circle" or "square".',
            true
          )
          return false
        }
      }
  
      // Check chat messages if present
      if (data.chatMessages !== undefined) {
        if (!Array.isArray(data.chatMessages)) {
          showStatusMessage('Invalid configuration: chatMessages is not an array.', true)
          return false
        }
  
        // Check message structure (basic validation)
        for (let i = 0; i < data.chatMessages.length; i++) {
          const msg = data.chatMessages[i]
          if (!msg.id || !msg.sender || (msg.sender !== 'me' && msg.sender !== 'visitor')) {
            showStatusMessage(
              `Invalid configuration: Message at index ${i} has invalid structure.`,
              true
            )
            return false
          }
        }
      }
  
      return true
    }
  
    /**
     * Update all stores with data from the parsed configuration
     * @param {Object} data - The validated configuration data
     */
    function updateStoresFromConfig(data) {
      // Update profile, theme, and avatars if present
      if (data.profile || data.activeTheme || data.avatars) {
        userConfig.update((currentConfig) => {
          const newConfig = { ...currentConfig }
  
          // Update profile if present
          if (data.profile) {
            // Extract work start date to handle separately
            const { WORK_START_DATE, ...profileWithoutDate } = data.profile
  
            // Update profile
            newConfig.profile = {
              ...currentConfig.profile,
              ...profileWithoutDate,
            }
  
            // Update work start date if present
            if (WORK_START_DATE) {
              workStartDate.set(WORK_START_DATE)
            }
          }
  
          // Update theme if present
          if (data.activeTheme) {
            newConfig.activeTheme = data.activeTheme
          }
  
          // Update avatars if present
          if (data.avatars) {
            newConfig.avatars = {
              ...currentConfig.avatars,
              ...data.avatars,
            }
          }
  
          return newConfig
        })
      }
  
      // Update chat messages if present
      if (data.chatMessages) {
        chatMessages.set(data.chatMessages)
      }
    }
  </script>
  
  <div class="p-3 border border-gray-200 rounded-md bg-white">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Configuration Management</h3>
  
    <!-- Export Format Selection -->
    <div class="pb-2 mb-3 border-b border-gray-200">
      <h4 class="text-xs font-medium text-gray-500 uppercase mb-2">
        Export Format
      </h4>
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input
            type="radio"
            id="format-json"
            bind:group={exportFormat}
            value="json"
            class="mr-1 text-primary focus:ring-primary"
            aria-describedby="tooltip-json-format"
          />
          <span class="text-sm">JSON</span>
          <span class="ml-1 text-xs text-gray-500">(Complete Backup)</span>
          <HelpIconTooltip text="JSON format includes all settings including chat messages, theme, profile, and avatars - best for complete backups." position="top"/>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            id="format-js"
            bind:group={exportFormat}
            value="js"
            class="mr-1 text-primary focus:ring-primary"
            aria-describedby="tooltip-js-format"
          />
          <span class="text-sm">JavaScript</span>
          <span class="ml-1 text-xs text-gray-500">(Profile Only)</span>
          <HelpIconTooltip text="JavaScript format exports profile settings only as a JS module that can be imported directly into your project. Doesn't include chat messages." position="top"/>
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
        <svg
          class="w-4 h-4 mr-2 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          ></path>
        </svg>
        Download Configuration
        <HelpIconTooltip text="Save all your current settings to a file that you can use as a backup or share with others." position="top"/>
      </button>
  
      <!-- Copy for GitHub Button -->
      <button
        type="button"
        on:click={copyConfigForGitHub}
        class="w-full mt-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
      >
        <svg
          class="w-4 h-4 mr-2 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clip-rule="evenodd"
          />
        </svg>
        Prepare for GitHub Update
        <HelpIconTooltip text="Copy your configuration to clipboard so you can update your profileChatterConfig.json file on GitHub. This will trigger an automatic rebuild of your SVG." position="top"/>
      </button>
  
      <!-- GitHub Instructions Panel -->
      {#if showGitHubInstructions}
        <div
          class="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50 transition-all"
          transition:slide={{ duration: 300 }}
        >
          <div class="flex justify-between items-start mb-2">
            <h4 class="text-sm font-medium text-blue-800">
              How to Update Your Profile SVG on GitHub:
            </h4>
            <button
              type="button"
              on:click={dismissGitHubInstructions}
              class="text-blue-500 hover:text-blue-700 focus:outline-none"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
  
          <ol class="list-decimal pl-5 space-y-2 text-sm text-gray-700">
            <li>
              <strong>Configuration Copied:</strong> The content for your
              <code class="bg-blue-100 px-1 rounded">profileChatterConfig.json</code> file has been copied
              to your clipboard.
            </li>
  
            <li>
              <strong>Go to Your Repository:</strong> Open your forked ProfileChatter repository on
              GitHub.
              <br /><span class="text-xs text-gray-500"
                >(e.g., https://github.com/YOUR_USERNAME/ProfileChatter)</span
              >
            </li>
  
            <li>
              <strong>Edit/Create 'profileChatterConfig.json':</strong>
              <ul class="list-disc pl-5 mt-1 text-xs">
                <li>
                  If <code class="bg-blue-100 px-1 rounded">profileChatterConfig.json</code> already exists
                  at the root of your repository, click on it, then click the 'Edit this file' (pencil)
                  icon.
                </li>
                <li>
                  If it doesn't exist, click 'Add file' -> 'Create new file'. Name the new file <code
                    class="bg-blue-100 px-1 rounded">profileChatterConfig.json</code
                  >.
                </li>
              </ul>
            </li>
  
            <li>
              <strong>Paste Content:</strong> Delete all existing content in the file editor (if any) and
              paste (Ctrl+V or Cmd+V) the configuration from your clipboard.
            </li>
  
            <li>
              <strong>Commit Changes:</strong>
              <ul class="list-disc pl-5 mt-1 text-xs">
                <li>Scroll to the bottom of the page.</li>
                <li>Enter a commit message (e.g., "Update ProfileChatter configuration").</li>
                <li>Ensure "Commit directly to the 'main' branch" is selected.</li>
                <li>Click "Commit changes".</li>
              </ul>
            </li>
  
            <li>
              <strong>Auto-Update:</strong> The GitHub Action in your repository will automatically run,
              rebuild your SVG with the new settings, and update your profile README link. This may take
              a few minutes.
            </li>
          </ol>
  
          <div class="mt-4 text-right">
            <button
              type="button"
              on:click={dismissGitHubInstructions}
              class="py-1 px-3 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-300 transition-colors duration-200"
            >
              Dismiss Instructions
            </button>
          </div>
        </div>
      {/if}
  
      <!-- Export Specific Parts -->
      <div class="pt-2 mt-2 border-t border-gray-200">
        <h4 class="text-xs font-medium text-gray-500 uppercase mb-2">
          Export Specific Parts
          <HelpIconTooltip text="Export individual components of your configuration separately, instead of exporting everything at once." position="top"/>
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            on:click={exportChatMessages}
            class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              class="w-3 h-3 mr-1 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Export Chat Messages
            <HelpIconTooltip text="Save only your chat messages to a separate file. Useful if you want to back up or share just your conversations." position="bottom"/>
          </button>
  
          <button
            type="button"
            on:click={exportThemeSettings}
            class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              class="w-3 h-3 mr-1 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Export Theme Settings
            <HelpIconTooltip text="Save just your theme customizations to a separate file. Useful for creating and sharing theme presets." position="bottom"/>
          </button>
  
          <button
            type="button"
            on:click={exportProfileData}
            class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              class="w-3 h-3 mr-1 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Export Profile Data
            <HelpIconTooltip text="Save your personal and professional profile settings to a separate file, including name, profession, location, etc." position="bottom"/>
          </button>
  
          <button
            type="button"
            on:click={exportAvatarSettings}
            class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              class="w-3 h-3 mr-1 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Export Avatar Settings
            <HelpIconTooltip text="Save your avatar configuration to a separate file, including avatar images, fallback text, and shape settings." position="bottom"/>
          </button>
        </div>
      </div>
  
      <!-- Toggle Upload Section Button -->
      <button
        type="button"
        on:click={toggleUploadSection}
        class="group w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm
                  bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
                  focus:ring-offset-2 focus:ring-primary flex items-center justify-center
                  transition-colors duration-200"
      >
        <!--  Icon forced white via text-white so it never inherits the label colour  -->
        <svg
          class="w-4 h-4 mr-2 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
  
        <!--  Label keeps its own grey palette, independent of the icon  -->
        <span class="text-gray-700 group-hover:text-gray-900">
          {showUploadSection ? 'Hide Upload Section' : 'Upload Configuration'}
        </span>
        <HelpIconTooltip text="Upload a previously exported configuration file to restore your settings." position="top"/>
      </button>
  
      <!-- Upload Section (Expandable) -->
      {#if showUploadSection}
        <div
          class="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 transition-all"
          transition:slide={{ duration: 300 }}
        >
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
  
            <!-- Hidden File Input for Specific Parts -->
            <input
              type="file"
              accept=".json"
              bind:this={specificPartFileInput}
              on:change={loadSpecificPartFromFile}
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
                <div
                  class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"
                ></div>
                Processing...
              {:else}
                <!--  Icon forced to white; never inherits label colour  -->
                <svg
                  class="w-4 h-4 mr-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  ></path>
                </svg>
                Select Configuration File
              {/if}
            </button>
  
            <!-- Import Specific Part section -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <h5 class="text-xs font-medium text-gray-500 uppercase mb-2">
                Import Specific Part
                <HelpIconTooltip text="Import just a specific part of a configuration, such as only the theme settings or only the chat messages." position="top"/>
              </h5>
  
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  on:click={() => importSpecificPart('messages')}
                  class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg
                    class="w-3 h-3 mr-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    ></path>
                  </svg>
                  Import Chat Messages
                </button>
  
                <button
                  type="button"
                  on:click={() => importSpecificPart('theme')}
                  class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg
                    class="w-3 h-3 mr-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    ></path>
                  </svg>
                  Import Theme Settings
                </button>
  
                <button
                  type="button"
                  on:click={() => importSpecificPart('profile')}
                  class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg
                    class="w-3 h-3 mr-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  Import Profile Data
                </button>
  
                <button
                  type="button"
                  on:click={() => importSpecificPart('avatars')}
                  class="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg
                    class="w-3 h-3 mr-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Import Avatar Settings
                </button>
              </div>
  
              <p class="text-xs text-gray-500 mt-2">
                Select the type of component to import, then choose the corresponding JSON file.
              </p>
            </div>
  
            <p class="text-xs text-gray-500 mt-3">
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
  
  <!-- Connected Services section - Dynamically renders all providers -->
  <div class="p-3 border border-gray-200 rounded-md bg-white mt-6">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Connected Services</h3>
  
    {#if Object.keys(oauthStatuses).length === 0}
      <div class="text-sm text-gray-500 py-2">Loading connected services...</div>
    {:else}
      {#each Object.entries(oauthStatuses) as [providerName, status] (providerName)}
        <div class="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0">
          <OAuthStatusDisplay providerName={cap(providerName)} {status} />
  
          <button
            type="button"
            on:click={() => connectProvider(providerName)}
            class={`mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${status?.authenticated && status?.valid
                    ? 'bg-green-600 hover:bg-green-700 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200
                  disabled:opacity-50`}
            disabled={status?.authenticated && status?.valid}
          >
            {#if !status?.authenticated}
              Connect {cap(providerName)}
            {:else if !status?.valid}
              Reconnect {cap(providerName)}
            {:else}
              Connected
            {/if}
          </button>
  
          {#if status?.authenticated && status?.valid}
            <p class="mt-2 text-xs text-gray-500">
              Your {cap(providerName)} account is connected and working.
              {#if providerName === 'spotify'}
                Now playing and recently played tracks will be displayed in your profile.
              {:else if providerName === 'github'}
                Your GitHub data will be accessible in your profile.
              {/if}
            </p>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
  
  <style>
    /* Button transition styling */
    button {
      transition:
        transform 0.1s ease-in-out,
        background-color 0.2s ease;
    }
  
    button:active {
      transform: scale(0.98);
    }
  </style>