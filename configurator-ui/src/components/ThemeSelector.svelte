<script>
  import { userConfig } from '../stores/configStore.js';
  
  // Define available themes
  const availableThemes = [
    { id: 'ios', name: 'iOS Style', description: 'Blue user bubbles, gray visitor bubbles, rounded corners' },
    { id: 'android', name: 'Android Style', description: 'Light blue user bubbles, light gray visitor bubbles, less rounded corners' }
  ];
  
  // For visual preview
  function getThemePreviewClasses(themeId) {
    if (themeId === 'ios') {
      return {
        me: 'bg-[#0B93F6] text-white rounded-2xl',
        visitor: 'bg-[#E5E5EA] text-black rounded-2xl'
      };
    } else if (themeId === 'android') {
      return {
        me: 'bg-[#D1E6FF] text-black rounded-lg',
        visitor: 'bg-[#F0F0F0] text-black rounded-lg'
      };
    }
    
    return {
      me: 'bg-gray-500 text-white rounded-lg',
      visitor: 'bg-gray-200 text-black rounded-lg'
    };
  }
  
  // Get preview classes based on current selection  
  $: previewClasses = getThemePreviewClasses($userConfig.activeTheme);
</script>

<div class="p-3 border border-gray-200 rounded-md bg-white">
  <h3 class="text-sm font-medium text-gray-700 mb-3">Theme Settings</h3>
  
  <div class="mb-4">
    <label for="theme-selector" class="block text-sm font-medium text-gray-700 mb-1">Select Theme</label>
    <select 
      id="theme-selector" 
      bind:value={$userConfig.activeTheme}
      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
    >
      {#each availableThemes as theme}
        <option value={theme.id}>{theme.name}</option>
      {/each}
    </select>
    
    <!-- Theme Description -->
    {#each availableThemes as theme}
      {#if theme.id === $userConfig.activeTheme}
        <p class="mt-1 text-xs text-gray-500">{theme.description}</p>
      {/if}
    {/each}
  </div>
  
  <!-- Theme Preview -->
  <div class="mt-3">
    <label class="block text-sm font-medium text-gray-700 mb-2">Theme Preview</label>
    <div class="bg-gray-50 p-3 rounded-md">
      <!-- User message bubble -->
      <div class="flex justify-end mb-2">
        <div class={`p-2 px-3 max-w-[80%] ${previewClasses.me}`}>
          <span class="text-xs">Hello!</span>
        </div>
      </div>
      
      <!-- Visitor message bubble -->
      <div class="flex justify-start">
        <div class={`p-2 px-3 max-w-[80%] ${previewClasses.visitor}`}>
          <span class="text-xs">Hi there, nice to meet you!</span>
        </div>
      </div>
    </div>
  </div>
</div>