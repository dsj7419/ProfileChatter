<script>
  import { userConfig } from '../stores/configStore.js';
  import HelpIconTooltip from '../lib/ui/HelpIconTooltip.svelte';
  
  // Define regex to validate Base64 data URI format
  const base64DataUriRegex = /^data:image\/(?:png|jpeg|gif|svg\+xml);base64,([a-zA-Z0-9+/]+={0,2})$/;
  
  // Reactive variables to track validation state
  $: meAvatarUrlIsValidBase64 = $userConfig.avatars.me.imageUrl && base64DataUriRegex.test($userConfig.avatars.me.imageUrl);
  $: visitorAvatarUrlIsValidBase64 = $userConfig.avatars.visitor.imageUrl && base64DataUriRegex.test($userConfig.avatars.visitor.imageUrl);
  
  // Function to update store to ensure deep reactivity
  function updateStore() {
    userConfig.update(c => c);
  }
  
  // Handle image URL input changes with store update
  function handleInputChange() {
    updateStore();
  }
  
  // Function to derive initials from name (if available)
  $: {
    if ($userConfig.avatars.me.fallbackText === "ME" && $userConfig.profile.NAME && $userConfig.profile.NAME !== "Your Name") {
      // Try to extract initials
      const nameParts = $userConfig.profile.NAME.split(" ");
      if (nameParts.length >= 2) {
        const initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        if (initials.length === 2) {
          $userConfig.avatars.me.fallbackText = initials;
          updateStore();
        }
      }
    }
  }
</script>

<div class="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
  <h3 class="text-sm font-medium text-gray-800 mb-3">Avatar Settings</h3>
  
  <!-- Enable/Disable Avatars -->
  <div class="mb-4">
    <label class="flex items-center">
      <input 
        type="checkbox" 
        bind:checked={$userConfig.avatars.enabled} 
        on:change={updateStore}
        class="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
      />
      <span class="text-sm font-medium text-gray-700">Enable Avatars</span>
      <HelpIconTooltip text="Show avatar images next to chat messages. When disabled, messages will be displayed without avatars." />
    </label>
  </div>
  
  <!-- Note about preview limitations -->
  <div class="mb-4 p-2 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-800">
    <p class="text-xs">
      <strong>Note:</strong> The preview server may not fully reflect avatar changes in real-time. 
      The final SVG generation will use these settings.
    </p>
  </div>
  
  <!-- Avatar Settings (only visible when enabled) -->
  {#if $userConfig.avatars.enabled}
    <!-- Avatar Shape -->
    <div class="mb-4">
      <span id="avatar-shape-label" class="block text-sm font-medium text-gray-700 mb-2">
        Avatar Shape:
        <HelpIconTooltip text="Choose between circular or square avatars. Circular is the most common style for chat interfaces." />
      </span>
      <div class="flex space-x-4" role="radiogroup" aria-labelledby="avatar-shape-label">
        <label class="flex items-center">
          <input 
            type="radio" 
            id="shape-circle"
            bind:group={$userConfig.avatars.shape} 
            value="circle" 
            on:change={updateStore}
            class="mr-1 text-primary focus:ring-primary"
          />
          <span class="text-sm">Circle</span>
        </label>
        <label class="flex items-center">
          <input 
            type="radio" 
            id="shape-square"
            bind:group={$userConfig.avatars.shape} 
            value="square" 
            on:change={updateStore}
            class="mr-1 text-primary focus:ring-primary"
          />
          <span class="text-sm">Square</span>
        </label>
      </div>
    </div>
    
    <!-- "Me" Avatar Settings -->
    <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Your Avatar (Me)</h4>
      
      <div class="mb-3">
        <label for="me-image-url" class="block text-xs font-medium text-gray-500 mb-1">
          Image URL:
          <HelpIconTooltip text="The URL for your avatar image. For GitHub compatibility, use a base64 encoded image string. This ensures the image is embedded directly in the SVG." />
        </label>
        <div class="relative">
          <input 
            type="text" 
            id="me-image-url" 
            bind:value={$userConfig.avatars.me.imageUrl} 
            on:input={handleInputChange}
            class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="data:image/png;base64,..."
          />
          {#if $userConfig.avatars.me.imageUrl.trim() !== ''}
            <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {#if meAvatarUrlIsValidBase64}
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only">Valid Base64 Format</span>
              {:else}
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only">Invalid Base64 Format</span>
              {/if}
            </span>
          {/if}
        </div>
        <p class="mt-1 text-xs text-gray-500">For GitHub compatibility, use base64 encoded images (data:image/png;base64,...).</p>
        <div class="mt-1 text-xs flex items-center">
          <span class="text-gray-500">Need to convert an image to Base64?</span>
          <a href="https://www.base64-image.de/" target="_blank" rel="noopener noreferrer" class="ml-1 text-primary hover:underline font-medium transition-colors">
            Try an online converter
          </a>
          {#if $userConfig.avatars.me.imageUrl.trim() !== '' && !meAvatarUrlIsValidBase64}
            <div class="mt-1 text-xs text-red-500">
              Warning: Current URL is not a valid Base64 data URI. External URLs may not display on GitHub.
            </div>
          {/if}
        </div>
      </div>
      
      <div>
        <label for="me-fallback-text" class="block text-xs font-medium text-gray-500 mb-1">
          Fallback Text:
          <HelpIconTooltip text="Text displayed when your image isn't available or while it's loading. Usually your initials (e.g., JD for John Doe). Limited to 2 characters." />
        </label>
        <input 
          type="text" 
          id="me-fallback-text" 
          bind:value={$userConfig.avatars.me.fallbackText} 
          on:input={handleInputChange}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          placeholder="Initials (e.g., DJ)"
          maxlength="2"
        />
        <p class="mt-1 text-xs text-gray-500">Used when image is unavailable. Max 2 characters.</p>
      </div>
    </div>
    
    <!-- "Visitor" Avatar Settings -->
    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Visitor Avatar</h4>
      
      <div class="mb-3">
        <label for="visitor-image-url" class="block text-xs font-medium text-gray-500 mb-1">
          Image URL:
          <HelpIconTooltip text="The URL for the visitor avatar image. For GitHub compatibility, use a base64 encoded image string." />
        </label>
        <div class="relative">
          <input 
            type="text" 
            id="visitor-image-url" 
            bind:value={$userConfig.avatars.visitor.imageUrl} 
            on:input={handleInputChange}
            class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="data:image/png;base64,..."
          />
          {#if $userConfig.avatars.visitor.imageUrl.trim() !== ''}
            <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {#if visitorAvatarUrlIsValidBase64}
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only">Valid Base64 Format</span>
              {:else}
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only">Invalid Base64 Format</span>
              {/if}
            </span>
          {/if}
        </div>
        <p class="mt-1 text-xs text-gray-500">For GitHub compatibility, use base64 encoded images (data:image/png;base64,...).</p>
        <div class="mt-1 text-xs flex items-center">
          <span class="text-gray-500">Need to convert an image to Base64?</span>
          <a href="https://www.base64-image.de/" target="_blank" rel="noopener noreferrer" class="ml-1 text-primary hover:underline font-medium transition-colors">
            Try an online converter
          </a>
          {#if $userConfig.avatars.visitor.imageUrl.trim() !== '' && !visitorAvatarUrlIsValidBase64}
            <div class="mt-1 text-xs text-red-500">
              Warning: Current URL is not a valid Base64 data URI. External URLs may not display on GitHub.
            </div>
          {/if}
        </div>
      </div>
      
      <div>
        <label for="visitor-fallback-text" class="block text-xs font-medium text-gray-500 mb-1">
          Fallback Text:
          <HelpIconTooltip text="Text displayed when visitor image isn't available. Usually a question mark (?) or generic identifier. Limited to 2 characters." />
        </label>
        <input 
          type="text" 
          id="visitor-fallback-text" 
          bind:value={$userConfig.avatars.visitor.fallbackText} 
          on:input={handleInputChange}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          placeholder="? or other character"
          maxlength="2"
        />
        <p class="mt-1 text-xs text-gray-500">Used when image is unavailable. Max 2 characters.</p>
      </div>
    </div>
  {/if}
</div>