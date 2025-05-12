<script>
  import { chatMessages } from '../stores/configStore.js';
  
  // Function to update a message to ensure reactivity
  function updateMessage(message, newText) {
    message.text = newText;
    // This forces Svelte to recognize the change in the array
    chatMessages.update(messages => messages);
  }
  
  // Function to delete a message
  function deleteMessage(messageId, messageText) {
    // Pass messageText for the confirm dialog
    const confirmationText = messageText ? 
      `"${messageText.substring(0, 30)}${messageText.length > 30 ? '...' : ''}"` : 
      "this message";
    
    if (window.confirm(`Are you sure you want to delete ${confirmationText}?`)) {
      chatMessages.update(messages => messages.filter(msg => msg.id !== messageId));
    }
  }
  
  // Handle textarea auto-resize
  function autoResize(event) {
    const textarea = event.target;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to match the content
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
</script>

<div class="chat-list space-y-4">
  {#each $chatMessages as message, index (message.id)}
    <div class="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200">
      <!-- Message Header -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center">
          <span 
            class="inline-block w-3 h-3 rounded-full mr-2" 
            class:bg-primary={message.sender === 'me'} 
            class:bg-secondary={message.sender !== 'me'}>
          </span>
          <span class="font-medium">{message.sender === 'me' ? 'Me' : 'Visitor'}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-500">ID: {message.id}</span>
          
          <!-- Delete Button -->
          <button 
            type="button" 
            class="text-red-500 hover:text-red-700 transition-colors duration-200" 
            aria-label="Delete message"
            on:click={() => deleteMessage(message.id, message.text)}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Message Content -->
      {#if message.contentType === 'chart'}
        <!-- Chart Message (Read-only) -->
        <div class="border-l-4 border-accent pl-3 my-2">
          <div class="text-sm font-medium">Chart Type: {message.chartData.type}</div>
          {#if message.chartData.title}
            <div class="text-sm text-gray-600">Title: {message.chartData.title}</div>
          {/if}
          {#if message.chartData.items && Array.isArray(message.chartData.items)}
            <div class="text-xs text-gray-500 mt-1">
              {message.chartData.items.length} data items
            </div>
          {:else if message.chartData.items === '{wakatime_chart_data}'}
            <div class="text-xs text-gray-500 mt-1">
              Dynamic chart data: {message.chartData.items}
            </div>
          {/if}
        </div>
      {:else}
        <!-- Text Message (Editable) -->
        <div class="relative">
          <textarea 
            bind:value={message.text} 
            on:input={autoResize}
            class="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] resize-none transition-colors duration-200"
            placeholder="Enter message text..."
            rows={Math.max(3, (message.text.match(/\n/g) || []).length + 1)}
          ></textarea>
          <div class="absolute top-1 right-2">
            <span class="text-xs text-gray-400 bg-gray-50 px-1">Edit</span>
          </div>
        </div>
      {/if}
      
      <!-- Reaction (if present) -->
      {#if message.reaction}
        <div class="mt-2 flex items-center">
          <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">
            Reaction: {message.reaction}
          </span>
        </div>
      {/if}
    </div>
  {/each}

  {#if $chatMessages.length === 0}
    <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
      <p class="text-gray-500">No messages to display.</p>
    </div>
  {/if}
</div>

<style>
  /* Custom styling for textarea autoresize */
  textarea {
    overflow-y: hidden;
  }
</style>