<!-- GitHubCommitInstructions.svelte -->
<script>
    import { slide } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
  
    // Create a dispatcher for component events
    const dispatch = createEventDispatcher()
  
    // Define props for this component
    export let isVisible = false
  
    // Function to dispatch the dismiss event
    function handleDismiss() {
      dispatch('dismiss')
    }
  </script>
  
  {#if isVisible}
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
          on:click={handleDismiss}
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
          on:click={handleDismiss}
          class="py-1 px-3 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-300 transition-colors duration-200"
        >
          Dismiss Instructions
        </button>
      </div>
    </div>
  {/if}