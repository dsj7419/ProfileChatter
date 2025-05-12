<script>
    import { chatMessages } from '../stores/configStore.js';
    import EmojiPicker from './EmojiPicker.svelte';
    
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
  
    // Function to toggle the sender of a message
    function toggleSender(message) {
      // Toggle between 'me' and 'visitor'
      message.sender = message.sender === 'me' ? 'visitor' : 'me';
      // Update the store to trigger reactivity
      chatMessages.update(messages => messages);
    }
    
    // Emoji Picker Functionality
    let emojiPicker;
    let activeMessage = null;
    let reactionButtonRef = null;
    
    function openEmojiPicker(message, event) {
      // Set the target element reference for positioning
      reactionButtonRef = event.currentTarget;
      
      // Store which message we're editing
      activeMessage = message;
      
      // Open the picker
      emojiPicker.show();
    }
    
    function handleEmojiSelect(event) {
      if (!activeMessage) return;
      
      // Get the selected emoji
      const emoji = event.detail;
      
      // Set the reaction
      activeMessage.reaction = emoji;
      
      // Update the store
      chatMessages.update(messages => messages);
    }
    
    function clearReaction() {
      if (!activeMessage) return;
      
      // Remove the reaction
      delete activeMessage.reaction;
      
      // Update the store
      chatMessages.update(messages => messages);
    }
  
    // Drag and drop functionality
    let draggedIndex = -1;
    let dragOverIndex = -1;
  
    function handleDragStart(event, index) {
      // Store the index of the message being dragged
      draggedIndex = index;
      // Set data for transfer (required for Firefox)
      event.dataTransfer.setData('text/plain', index.toString());
      // Add some opacity to the dragged element for visual feedback
      event.currentTarget.classList.add('dragging');
      // Set effectAllowed to move for appropriate cursor
      event.dataTransfer.effectAllowed = 'move';
    }
  
    function handleDragOver(event, index) {
      event.preventDefault(); // Necessary to allow drop
      // Update the dragOverIndex for visual feedback
      dragOverIndex = index;
      // Set dropEffect to move for appropriate cursor
      event.dataTransfer.dropEffect = 'move';
    }
  
    function handleDragEnter(event) {
      // Add a class to highlight the drop target
      event.currentTarget.classList.add('drag-over');
    }
  
    function handleDragLeave(event) {
      // Remove the highlight class when dragging leaves
      event.currentTarget.classList.remove('drag-over');
    }
  
    function handleDrop(event, index) {
      event.preventDefault();
      
      // Get the index of the source item
      const sourceIndex = draggedIndex;
      // Get the index of the target item
      const targetIndex = index;
      
      // Don't do anything if dropping on the same item
      if (sourceIndex === targetIndex) return;
      
      // Clone the messages array to avoid mutation
      const messages = [...$chatMessages];
      // Remove the dragged item
      const [draggedItem] = messages.splice(sourceIndex, 1);
      // Insert it at the new position
      messages.splice(targetIndex, 0, draggedItem);
      
      // Update the store with the new order
      chatMessages.set(messages);
      
      // Reset drag state
      draggedIndex = -1;
      dragOverIndex = -1;
      
      // Remove any drag-over styling
      event.currentTarget.classList.remove('drag-over');
    }
  
    function handleDragEnd(event) {
      // Reset styling
      event.currentTarget.classList.remove('dragging');
      // Reset drag state
      draggedIndex = -1;
      dragOverIndex = -1;
      
      // Remove drag-over styling from all message cards
      document.querySelectorAll('.message-card').forEach(element => {
        element.classList.remove('drag-over');
      });
    }
  </script>
  
  <!-- Emoji Picker Component -->
  <EmojiPicker
    bind:this={emojiPicker}
    targetElement={reactionButtonRef}
    on:select={handleEmojiSelect}
    on:clear={clearReaction}
  />
  
  <div class="chat-list space-y-4" role="list">
    {#each $chatMessages as message, index (message.id)}
      <div 
        class="message-card border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200 relative pl-10"
        draggable="true"
        role="listitem"
        aria-grabbed={draggedIndex === index ? "true" : "false"}
        on:dragstart={(e) => handleDragStart(e, index)}
        on:dragover={(e) => handleDragOver(e, index)}
        on:dragenter={handleDragEnter}
        on:dragleave={handleDragLeave}
        on:drop={(e) => handleDrop(e, index)}
        on:dragend={handleDragEnd}
        class:drag-over={dragOverIndex === index && draggedIndex !== index}
        class:dragging={draggedIndex === index}
      >
        <!-- Drag handle -->
        <div class="drag-handle absolute left-2 top-0 bottom-0 flex items-center justify-center w-6 cursor-move" title="Drag to reorder">
          <svg class="w-4 h-8 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm4-8a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm4-8a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm4 4a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
        </div>
        
        <!-- Message Header -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <span 
              class="inline-block w-3 h-3 rounded-full mr-2" 
              class:bg-primary={message.sender === 'me'} 
              class:bg-secondary={message.sender !== 'me'}>
            </span>
            
            <!-- Sender with Toggle Button -->
            <div class="flex items-center">
              <span class="font-medium">{message.sender === 'me' ? 'Me' : 'Visitor'}</span>
              <button 
                type="button" 
                class="ml-2 text-gray-500 hover:text-gray-700 transition-colors p-1" 
                aria-label="Toggle sender"
                title="Toggle sender"
                on:click={() => toggleSender(message)}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
              </button>
            </div>
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
        
        <!-- Reaction (if present) with Edit capability -->
        <div class="mt-2 flex items-center gap-2">
          {#if message.reaction}
            <span class="reaction-badge text-xs bg-gray-200 px-2 py-1 rounded-full flex items-center">
              <span class="mr-1 reaction-display">{message.reaction}</span>
              <button 
                type="button" 
                class="text-gray-500 hover:text-gray-700 transition-colors reaction-edit-button" 
                aria-label="Edit reaction"
                title="Edit reaction"
                on:click={(e) => openEmojiPicker(message, e)}
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
            </span>
          {:else}
            <button 
              type="button" 
              class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
              aria-label="Add reaction"
              title="Add emoji reaction"
              on:click={(e) => openEmojiPicker(message, e)}
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Add Reaction</span>
            </button>
          {/if}
        </div>
        
        <!-- Drop indicator (visually shows where the dragged item will be placed) -->
        {#if dragOverIndex === index && draggedIndex !== index}
          <div class="drop-indicator"></div>
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
    
    /* Drag and drop styling */
    .drag-handle {
      opacity: 0.3;
      transition: opacity 0.2s;
    }
    
    .message-card:hover .drag-handle {
      opacity: 0.7;
    }
    
    .message-card.drag-over {
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
    }
    
    .message-card.dragging {
      opacity: 0.6;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .drop-indicator {
      position: absolute;
      height: 4px;
      left: 0;
      right: 0;
      top: -2px;
      background-color: #4f46e5;
      z-index: 10;
    }
    
    /* Reaction styling */
    .reaction-badge {
      transition: all 0.2s ease;
    }
    
    .reaction-badge:hover {
      background-color: #e5e7eb;
    }
    
    .reaction-display {
      font-size: 16px;
    }
  </style>