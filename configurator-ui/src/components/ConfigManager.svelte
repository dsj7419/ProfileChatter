<!-- ConfigManager.svelte -->
<script>
  import { getPreviewConfiguration } from '../stores/configStore.js'
  import GitHubCommitInstructions from './GitHubCommitInstructions.svelte'
  import ServiceConnections from './ServiceConnections.svelte'
  import GitHubSaveUIManager from './GitHubSaveUIManager.svelte'
  import LocalConfigManager from './LocalConfigManager.svelte'

  // State for showing GitHub instructions
  let showGitHubInstructions = false

  // Server URL for API requests - still needed for other functionality
  const previewServer = 'http://localhost:3001'

  // GitHub auth state (updated by ServiceConnections component)
  let isGithubAuthenticated = false
  let isGithubTokenValid = false

  // Handle GitHub authentication status updates from ServiceConnections component
  function handleGitHubAuthUpdate(event) {
    const { isAuthenticated, isValid } = event.detail
    isGithubAuthenticated = isAuthenticated
    isGithubTokenValid = isValid
  }

  /**
   * Generate config JSON and copy to clipboard for GitHub update
   */
  async function copyConfigForGitHub() {
    try {
      // Get the complete configuration using the function from the store
      const configData = getPreviewConfiguration()

      // Generate JSON string with proper formatting
      const jsonString = JSON.stringify(configData, null, 2)

      // Copy to clipboard
      await navigator.clipboard.writeText(jsonString)

      // Show GitHub instructions
      showGitHubInstructions = true
    } catch (err) {
      console.error('Error copying configuration to clipboard:', err)
    }
  }

  /**
   * Dismiss the GitHub instructions panel
   */
  function dismissGitHubInstructions() {
    showGitHubInstructions = false
  }
</script>

<div class="p-3 border border-gray-200 rounded-md bg-white">
  <h3 class="text-sm font-medium text-gray-700 mb-3">Configuration Management</h3>

  <!-- Use the new LocalConfigManager component -->
  <LocalConfigManager on:requestGitHubCopy={copyConfigForGitHub} />

  <!-- GitHub Instructions Panel -->
  <GitHubCommitInstructions 
    isVisible={showGitHubInstructions} 
    on:dismiss={dismissGitHubInstructions} 
  />
</div>

<!-- Connected Services section -->
<ServiceConnections on:githubAuthUpdate={handleGitHubAuthUpdate} />

<!-- Save Configuration to GitHub section - Now using the new component -->
<GitHubSaveUIManager isAuthenticated={isGithubAuthenticated} isValid={isGithubTokenValid} />