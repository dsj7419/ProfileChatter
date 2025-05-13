<script>
    // Props
    export let text = "";
    export let updateStore;
    
    /**
     * Handle textarea auto-resize
     * @param {Event} event - Input event from textarea
     */
    function autoResize(event) {
      const textarea = event.target;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content
      textarea.style.height = `${textarea.scrollHeight}px`;
      
      // Notify store of changes
      updateStore();
    }
</script>

<div class="relative">
  <textarea 
    bind:value={text} 
    on:input={autoResize}
    class="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] resize-none transition-colors duration-200"
    placeholder="Enter message text..."
    rows={Math.max(3, (text?.match(/\n/g) || []).length + 1)}
  ></textarea>
  <div class="absolute top-1 right-2">
    <span class="text-xs text-gray-400 bg-gray-50 px-1">Edit</span>
  </div>
</div>

<style>
  /* Custom styling for textarea autoresize */
  textarea {
    overflow-y: hidden;
  }
</style>