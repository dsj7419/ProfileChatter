<script>
    /** Re-usable color input with text hex field */
    export let id = '';
    export let label = '';
    export let value = '#000000';
  </script>
  
  <div class="mb-3">
    <label for={id} class="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <div class="flex gap-2">
      <input 
        type="color" 
        {id} 
        bind:value 
        class="h-8 w-8 rounded border border-gray-300"
      />
      <input 
        type="text" 
        bind:value 
        class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
      />
    </div>
  </div>