<script>
    import { userConfig } from '../stores/configStore.js';
    
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
  
  <div class="p-3 border border-gray-200 rounded-md bg-white">
    <h3 class="text-sm font-medium text-gray-700 mb-3">Avatar Settings</h3>
    
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
      </label>
    </div>
    
    <!-- Note about preview limitations -->
    <div class="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
      <p class="text-xs text-yellow-700">
        <strong>Note:</strong> The preview server may not fully reflect avatar changes in real-time. 
        The final SVG generation will use these settings.
      </p>
    </div>
    
    <!-- Avatar Settings (only visible when enabled) -->
    {#if $userConfig.avatars.enabled}
      <!-- Avatar Shape -->
      <div class="mb-4">
        <span id="avatar-shape-label" class="block text-sm font-medium text-gray-700 mb-2">Avatar Shape:</span>
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
      <div class="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Your Avatar (Me)</h4>
        
        <div class="mb-3">
          <label for="me-image-url" class="block text-xs font-medium text-gray-500 mb-1">Image URL:</label>
          <input 
            type="text" 
            id="me-image-url" 
            bind:value={$userConfig.avatars.me.imageUrl} 
            on:input={handleInputChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="data:image/png;base64,..."
          />
          <p class="mt-1 text-xs text-gray-500">For GitHub compatibility, use base64 encoded images (data:image/png;base64,...).</p>
        </div>
        
        <div>
          <label for="me-fallback-text" class="block text-xs font-medium text-gray-500 mb-1">Fallback Text:</label>
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
      <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Visitor Avatar</h4>
        
        <div class="mb-3">
          <label for="visitor-image-url" class="block text-xs font-medium text-gray-500 mb-1">Image URL:</label>
          <input 
            type="text" 
            id="visitor-image-url" 
            bind:value={$userConfig.avatars.visitor.imageUrl} 
            on:input={handleInputChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="data:image/png;base64,..."
          />
          <p class="mt-1 text-xs text-gray-500">For GitHub compatibility, use base64 encoded images (data:image/png;base64,...).</p>
        </div>
        
        <div>
          <label for="visitor-fallback-text" class="block text-xs font-medium text-gray-500 mb-1">Fallback Text:</label>
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