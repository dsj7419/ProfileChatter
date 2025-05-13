<script>
    import { createEventDispatcher } from 'svelte';
    import TextContentEditor from './TextContentEditor.svelte';
    import ChartContentEditor from './ChartContentEditor.svelte';
    
    // Props
    export let message;
    export let index;
    export let draggedIndex;
    export let dragOverIndex;
    export let onToggleSender;
    export let onDeleteMessage;
    export let onChangeContentType;
    export let onOpenEmojiPicker;
    export let updateStore;
    
    // Drag and drop handlers that call the parent's functions directly
    export let onDragStart;
    export let onDragOver;
    export let onDragEnter;
    export let onDragLeave; 
    export let onDrop;
    export let onDragEnd;
    
    // Function to handle content type change
    function handleContentTypeChange(event) {
      onChangeContentType(event.target.value);
    }
  </script>
  
  <div 
    class="message-card border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200 relative pl-10"
    draggable="true"
    role="listitem"
    aria-grabbed={draggedIndex === index ? "true" : "false"}
    on:dragstart={(e) => onDragStart(e, index)}
    on:dragover={(e) => onDragOver(e, index)}
    on:dragenter={(e) => onDragEnter(e)}
    on:dragleave={(e) => onDragLeave(e)}
    on:drop={(e) => onDrop(e, index)}
    on:dragend={(e) => onDragEnd(e)}
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
            on:click={onToggleSender}
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
          on:click={onDeleteMessage}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Content Type Selector -->
    <div class="mb-3">
      <label for="content-type-{message.id}" class="block text-sm font-medium text-gray-700 mb-1">Content Type:</label>
      <select 
        id="content-type-{message.id}" 
        class="w-full px-3 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
        value={message.contentType || 'text'} 
        on:change={handleContentTypeChange}
      >
        <option value="text">Text</option>
        <option value="chart">Chart</option>
      </select>
    </div>
    
    <!-- Message Content -->
    {#if message.contentType === 'chart'}
      <ChartContentEditor 
        bind:chartData={message.chartData} 
        {updateStore} 
      />
    {:else}
      <TextContentEditor 
        bind:text={message.text} 
        {updateStore} 
      />
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
            on:click={onOpenEmojiPicker}
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
          on:click={onOpenEmojiPicker}
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
  
  <style>
    /* Message card specific styles */
    .drag-handle {
      opacity: 0.3;
      transition: opacity 0.2s;
    }
    
    .message-card:hover .drag-handle {
      opacity: 0.7;
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