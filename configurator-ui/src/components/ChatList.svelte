<script>
    import { chatMessages } from '../stores/configStore.js';
    import ChatMessageCard from './ChatMessageCard.svelte';
    import EmojiPicker from './EmojiPicker.svelte';
    
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
      updateStore();
    }
    
    function clearReaction() {
      if (!activeMessage) return;
      
      // Remove the reaction
      delete activeMessage.reaction;
      
      // Update the store
      updateStore();
    }
    
    // Store update function to handle all nested changes
    function updateStore() {
      chatMessages.update(m => m);
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
    
    // Message modification functions
    function toggleSender(message) {
      // Toggle between 'me' and 'visitor'
      message.sender = message.sender === 'me' ? 'visitor' : 'me';
      // Update the store
      updateStore();
    }
    
    function deleteMessage(messageId, messageText) {
      // Pass messageText for the confirm dialog
      const confirmationText = messageText ? 
        `"${messageText.substring(0, 30)}${messageText.length > 30 ? '...' : ''}"` : 
        "this message";
      
      if (window.confirm(`Are you sure you want to delete ${confirmationText}?`)) {
        chatMessages.update(messages => messages.filter(msg => msg.id !== messageId));
      }
    }
    
    function changeContentType(message, newContentType) {
      // Update content type
      message.contentType = newContentType;
      
      // Handle data initialization/clearing based on new content type
      if (newContentType === "chart") {
        // Initialize chartData with defaults if it doesn't exist
        if (!message.chartData) {
          message.chartData = { 
            type: 'horizontalBar', 
            title: '', 
            items: [],
            maxValue: 100
          };
        }
        // Clear text as it's no longer primary for chart messages
        message.text = null;
      } else if (newContentType === "text") {
        // Initialize text if null or undefined
        if (message.text === null || message.text === undefined) {
          message.text = "";
        }
        // Clear chartData as it's not needed for text messages
        message.chartData = null;
      }
      
      // Force store update to ensure reactivity
      updateStore();
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
      <ChatMessageCard 
        {message} 
        {index}
        {draggedIndex}
        {dragOverIndex}
        onToggleSender={() => toggleSender(message)}
        onDeleteMessage={() => deleteMessage(message.id, message.text)}
        onChangeContentType={(newType) => changeContentType(message, newType)}
        onOpenEmojiPicker={(e) => openEmojiPicker(message, e)}
        {updateStore}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      />
    {/each}
  
    {#if $chatMessages.length === 0}
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <p class="text-gray-500">No messages to display.</p>
      </div>
    {/if}
  </div>
  
  <style>
    /* Chat list styles that affect child components using :global() */
    :global(.message-card.drag-over) {
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
    }
    
    :global(.message-card.dragging) {
      opacity: 0.6;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  </style>