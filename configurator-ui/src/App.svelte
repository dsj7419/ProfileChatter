<script>
    import { onMount } from 'svelte';
    import { chatMessages } from './stores/configStore.js';
    import ChatList from './components/ChatList.svelte';
    import ProfileEditor from './components/ProfileEditor.svelte';
    import ThemeSelector from './components/ThemeSelector.svelte';
    import ConfigManager from './components/ConfigManager.svelte';
    
    // State for loading status and errors
    let isLoading = true;
    let error = null;
    
    /**
     * Add a new text message to the chat sequence
     */
    function addNewTextMessage() {
      // Create a new message with default values
      const newMessage = {
        id: `msg-${Date.now()}`,  // Generate a unique ID using timestamp
        sender: "me",              // Default sender is "me"
        text: "",                  // Empty text by default
        contentType: "text"        // Default content type is "text"
        // reaction is not set (undefined by default)
      };
      
      // Update the chat messages store by adding the new message
      chatMessages.update(messages => [...messages, newMessage]);
    }
    
    // Fetch chat data on component mount
    onMount(async () => {
      try {
        // Fetch chatData.json from the main project directory
        const response = await fetch('/chatData.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        // Update the global chat messages store
        chatMessages.set(data);
        isLoading = false;
      } catch (err) {
        console.error('Error loading chat data:', err);
        error = err.message;
        isLoading = false;
      }
    });
  </script>
  
  <main class="w-full h-screen flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="bg-gray-800 text-white p-4 shadow-md">
      <h1 class="text-xl font-semibold">ProfileChatter Configurator</h1>
    </header>
    
    <!-- Main Content - Three Column Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar (Config Panel) -->
      <aside class="w-80 bg-gray-100 border-r overflow-y-auto">
        <div class="space-y-4 p-4">
          <ProfileEditor />
          <ThemeSelector />
          <ConfigManager />
        </div>
      </aside>
      
      <!-- Center Area (Chat Sequence Editor) -->
      <section class="flex-1 overflow-y-auto bg-white p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Chat Message Sequence Editor</h2>
          
          <!-- Add Message Button -->
          <button 
            type="button"
            on:click={addNewTextMessage}
            class="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors duration-200 flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Text Message
          </button>
        </div>
        
        {#if isLoading}
          <div class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        {:else if error}
          <div class="text-red-500 p-4 border border-red-300 rounded bg-red-50">
            Error loading chat data: {error}
          </div>
        {:else}
          <ChatList />
          
          <!-- Empty State Hint -->
          {#if $chatMessages.length === 0}
            <div class="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md text-blue-800">
              <p>No messages in chat sequence. Click the "Add New Text Message" button to create your first message.</p>
            </div>
          {/if}
        {/if}
      </section>
      
      <!-- Right Sidebar (Preview Pane) -->
      <aside class="w-80 bg-gray-100 border-l overflow-y-auto p-4">
        <h2 class="text-lg font-medium mb-4">SVG Preview Pane</h2>
        <div class="text-sm text-gray-600">
          The SVG preview will appear here.
        </div>
      </aside>
    </div>
  </main>
  
  <style>
    /* Global styling for buttons */
    :global(button) {
      transition: transform 0.1s ease-in-out, background-color 0.2s ease;
    }
    
    :global(button:active) {
      transform: scale(0.98);
    }
  </style>