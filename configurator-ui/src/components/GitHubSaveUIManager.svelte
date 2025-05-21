<!-- GitHubSaveUIManager.svelte -->
<script>
    import { getPreviewConfiguration } from '../stores/configStore.js'
    import HelpIconTooltip from '../lib/ui/HelpIconTooltip.svelte'
  
    // Props for GitHub authentication status
    export let isAuthenticated = false
    export let isValid = false
  
    // Server URL for API requests
    const previewServer = 'http://localhost:3001'
  
    // GitHub repository selection state
    let githubRepos = []
    let selectedRepoFullName = ''
    let isLoadingRepos = false
    let repoError = null
    let filePath = 'profileChatterConfig.json'
    let commitMessage = 'Update ProfileChatter configuration via UI'
  
    // GitHub save status state
    let gitSaveInProgress = false
    let gitStatusMessage = ''
    let gitStatusError = false
    let gitStatusCommitUrl = ''
  
    // Fetch GitHub repositories the user can write to
    async function fetchGithubRepos() {
      try {
        isLoadingRepos = true
        repoError = null
        
        const res = await fetch(`${previewServer}/api/github/user-repos`)
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Server returned ${res.status}`)
        }
        
        githubRepos = await res.json()
        
        // Pre-select a ProfileChatter fork if one exists
        const profileChatterFork = githubRepos.find(repo => repo.isProfileChatterFork)
        if (profileChatterFork) {
          selectedRepoFullName = profileChatterFork.fullName
        }
      } catch (err) {
        console.error('Error fetching GitHub repositories:', err)
        repoError = err.message
      } finally {
        isLoadingRepos = false
      }
    }
  
    // Reset GitHub save status
    function resetGitStatus() {
      gitStatusMessage = ''
      gitStatusError = false
      gitStatusCommitUrl = ''
    }
  
    // Handle Save to GitHub button click
    async function handleSaveToGithub() {
      if (!selectedRepoFullName) {
        resetGitStatus()
        gitStatusMessage = 'Please select a repository first.'
        gitStatusError = true
        return;
      }
      
      try {
        resetGitStatus()
        gitSaveInProgress = true
        gitStatusMessage = 'Saving to GitHub...'
        
        // Get the current configuration from the store
        const configContent = JSON.stringify(getPreviewConfiguration(), null, 2)
        
        const res = await fetch(`${previewServer}/api/github/save-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoFullName: selectedRepoFullName,
            filePath,
            commitMessage,
            configContent
          })
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Status ${res.status}`);
        }
        
        gitStatusCommitUrl = data.commitUrl;
        gitStatusMessage = `Configuration saved successfully! <a href="${gitStatusCommitUrl}" target="_blank" class="underline text-blue-600 hover:text-blue-800">View commit on GitHub</a>`;
        gitStatusError = false;
      } catch (err) {
        console.error('Error saving to GitHub:', err);
        gitStatusMessage = `Error saving to GitHub: ${err.message}. Please try again.`;
        gitStatusError = true;
      } finally {
        gitSaveInProgress = false;
      }
    }
  
    // Reactive fetch of repositories when GitHub becomes authenticated
    $: if (
      isAuthenticated && 
      isValid && 
      githubRepos.length === 0 && 
      !isLoadingRepos && 
      !repoError
    ) {
      fetchGithubRepos()
    }
  </script>
  
  <div class="p-3 border border-gray-200 rounded-md bg-white mt-6">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Save Configuration to GitHub</h3>
  
    {#if isAuthenticated && isValid}
      <!-- Repository selection UI -->
      {#if isLoadingRepos}
        <div class="py-4 space-y-2" aria-busy="true">
          <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      {:else if repoError}
        <div class="py-2">
          <p class="text-sm text-red-600 mb-2">Error: {repoError}</p>
          <button 
            type="button"
            on:click={fetchGithubRepos}
            class="py-1 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary"
          >
            Retry
          </button>
        </div>
      {:else if githubRepos.length === 0}
        <p class="text-sm text-gray-500 py-2">
          No writable repositories found. Ensure you have push access to your ProfileChatter fork.
        </p>
      {:else}
        <div class="mb-4">
          <label for="repo-select" class="block mb-1 text-xs font-medium text-gray-500 uppercase">
            Select Repository
            <HelpIconTooltip text="Choose the repository where your configuration will be saved." position="top"/>
          </label>
          <select
            id="repo-select"
            class="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            bind:value={selectedRepoFullName}
          >
            <option value="" disabled>Select a repository...</option>
            {#each githubRepos as repo}
              <option value={repo.fullName}>
                {repo.isProfileChatterFork ? '⭐ ' : ''}{repo.fullName}
              </option>
            {/each}
          </select>
        </div>
  
        <!-- Commit details -->
        {#if selectedRepoFullName}
          <div class="mb-3">
            <label for="file-path" class="text-xs font-medium text-gray-500 uppercase mb-1 inline-flex items-center">
              File Path in Repository
              <HelpIconTooltip
                text="The standard location for ProfileChatter configuration file."
                position="top"
              />
            </label>
            <input
              id="file-path"
              type="text"
              class="w-full border-gray-300 rounded-md text-sm bg-gray-100 cursor-not-allowed"
              value={filePath}
              disabled
              aria-describedby="filepath-help"
            />
            <p id="filepath-help" class="mt-1 text-xs text-gray-500">Standard configuration filename, not editable.</p>
          </div>
  
          <div class="mb-4">
            <label for="commit-message" class="block text-xs font-medium text-gray-500 uppercase mb-1">
              Commit Message
              <HelpIconTooltip
                text="A descriptive message for this change, visible in your repository's commit history."
                position="top"
              />
            </label>
            <input
              id="commit-message"
              type="text"
              class="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              bind:value={commitMessage}
              placeholder="Update ProfileChatter configuration via UI"
            />
          </div>
        {/if}
  
        <!-- GitHub save status area (persistent) -->
        {#if gitStatusMessage}
          <div
            class="mt-2 p-2 rounded-md text-sm"
            class:bg-green-100={!gitStatusError && !gitSaveInProgress}
            class:text-green-800={!gitStatusError && !gitSaveInProgress}
            class:bg-red-100={gitStatusError}
            class:text-red-800={gitStatusError}
            class:bg-gray-100={gitSaveInProgress}
            class:text-gray-800={gitSaveInProgress}
          >
            {@html gitStatusMessage}
          </div>
        {/if}
      {/if}
  
      <!-- Save to GitHub button -->
      <button
        type="button"
        class="w-full mt-4 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200
               {selectedRepoFullName && commitMessage && !gitSaveInProgress ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}"
        on:click={handleSaveToGithub}
        disabled={!selectedRepoFullName || !commitMessage || gitSaveInProgress}
        aria-label="Save configuration to GitHub repository"
      >
        <div class="flex items-center justify-center">
          {#if gitSaveInProgress}
            <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Saving...
          {:else}
            <svg
              class="w-4 h-4 mr-2"
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
            Save to GitHub Repository
          {/if}
        </div>
      </button>
    {:else}
      <!-- Not authenticated with GitHub -->
      <p class="text-sm text-gray-500 mb-3">
        Connect to GitHub to enable saving your configuration directly to your repository.
      </p>
      <p class="text-sm text-blue-600 mb-3">
        Please use the GitHub connection option in the Connected Services section above.
      </p>
    {/if}
  </div>