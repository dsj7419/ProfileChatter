<!-- ServiceConnections.svelte -->
<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte'
    import OAuthStatusDisplay from './OAuthStatusDisplay.svelte'
  
    // Create event dispatcher for component events
    const dispatch = createEventDispatcher()
  
    // OAuth state management
    let oauthStatuses = {}
    const previewServer = 'http://localhost:3001'
  
    // Track previous GitHub auth status to detect changes
    let prevGitHubAuthStatus = { authenticated: false, valid: false }
  
    // Helper for capitalizing a string
    function cap(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  
    /**
     * Fetch OAuth status from server
     */
    async function refreshOauthStatus() {
      try {
        const res = await fetch(`${previewServer}/oauth-status`)
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`)
        }
        
        const newStatuses = await res.json()
        oauthStatuses = newStatuses
        
        // Check if GitHub auth status has changed
        const currentGitHubStatus = newStatuses?.github || { authenticated: false, valid: false }
        
        if (
          currentGitHubStatus.authenticated !== prevGitHubAuthStatus.authenticated || 
          currentGitHubStatus.valid !== prevGitHubAuthStatus.valid
        ) {
          // Dispatch event with the new GitHub auth status
          dispatch('githubAuthUpdate', { 
            isAuthenticated: currentGitHubStatus.authenticated, 
            isValid: currentGitHubStatus.valid 
          })
          
          // Update previous state
          prevGitHubAuthStatus = {
            authenticated: currentGitHubStatus.authenticated,
            valid: currentGitHubStatus.valid
          }
        }
      } catch (err) {
        console.error('Failed to fetch OAuth status:', err)
        oauthStatuses = {} // Empty object to handle gracefully in the UI
      }
    }
  
    /**
     * Navigate to provider authentication endpoint
     * @param {string} providerName - Name of OAuth provider to connect
     */
    function connectProvider(providerName) {
      window.location.href = `${previewServer}/auth/${providerName}`
    }
  
    // Set up polling of OAuth status and cleanup on component destroy
    onMount(() => {
      // Initial fetch of OAuth status
      refreshOauthStatus()
      
      // Set up interval to refresh status
      const interval = setInterval(refreshOauthStatus, 60000) // 1 minute refresh
      
      // Return cleanup function
      return () => clearInterval(interval)
    })
  </script>
  
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