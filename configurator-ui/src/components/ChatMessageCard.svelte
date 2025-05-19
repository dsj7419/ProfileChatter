<script lang="ts">
    import TextContentEditor from './TextContentEditor.svelte';
    import ChartContentEditor from './ChartContentEditor.svelte';
  
    /* props */
    export let message;
    export let index: number;
    export let draggedIndex: number;
    export let dragOverIndex: number;
  
    export let onToggleSender: () => void;
    export let onDeleteMessage: () => void;
    export let onChangeContentType: (val: string) => void;
    export let onOpenEmojiPicker: (e: MouseEvent) => void;
    export let updateStore: () => void;
  
    /* dnd callbacks passed from parent */
    export let onDragStart;
    export let onDragOver;
    export let onDragEnter;
    export let onDragLeave;
    export let onDrop;
    export let onDragEnd;
  
    function handleTypeChange(e: Event) {
      onChangeContentType((e.target as HTMLSelectElement).value);
    }
  </script>
  
  <!-- ─────────────────────────── CARD ─────────────────────────── -->
  <div
    class="message-card relative border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200 pl-10"
    on:dragover={(e) => onDragOver(e, index)}
    on:dragenter={(e) => onDragEnter(e)}
    on:dragleave={(e) => onDragLeave(e)}
    on:drop={(e) => onDrop(e, index)}
    class:drag-over={dragOverIndex === index && draggedIndex !== index}
    role="listitem"
    aria-grabbed={draggedIndex === index}
  >
  
    <!-- ─────────────── DRAG HANDLE (only element draggable) ─────────────── -->
    <div
        class="absolute left-2 top-0 bottom-0 flex items-center justify-center
            w-6 cursor-move select-none"
        draggable="true"
        on:dragstart={(e) => onDragStart(e, index)}
        on:dragend={(e) => onDragEnd(e)}
        role="button"
        aria-label="Drag to reorder"
        tabindex="0"
        >
        <!-- Modern grip: two rounded bars -->
        <svg
        class="icon drag-icon text-gray-400 hover:text-gray-600
                transition-colors"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
        >
        <!-- left bar -->
        <path d="M5 4.5v7"   stroke-linecap="round" />
        <!-- right bar -->
        <path d="M11 4.5v7"  stroke-linecap="round" />
        </svg>
        </div>

        <style>
        /* Optional flare: lighten the handle while dragging */
        :global(.dragging) .drag-icon {
        @apply text-primary;
        }                                                       
    </style>
  
    <!-- ───────────────────────── HEADER ───────────────────────── -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <!-- sender dot -->
        <span
          class="inline-block w-3 h-3 rounded-full"
          class:bg-primary={message.sender === 'me'}
          class:bg-secondary={message.sender !== 'me'}
        />
  
        <!-- sender label & toggle -->
        <span class="font-medium">{message.sender === 'me' ? 'Me' : 'Visitor'}</span>
        <button
          type="button"
          class="icon-btn ml-1"
          aria-label="Toggle sender"
          on:click={onToggleSender}
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M8 7h12m0 0-4-4m4 4-4 4M4 17h12m0 0-4 4m4-4-4-4" />
          </svg>
        </button>
      </div>
  
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500">ID:&nbsp;{message.id}</span>
  
        <!-- delete -->
        <button
            type="button"
            class="icon-btn text-red-500 hover:text-red-700"
            aria-label="Delete message"
            on:click={onDeleteMessage}
            >
            <svg
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="background:none"
            >
                <path d="M19 7 18.133 19.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16" />
            </svg>
        </button>
      </div>
    </div>
  
    <!-- ─────────────────── CONTENT TYPE SELECTOR ─────────────────── -->
    <div class="mb-3">
      <label for="type-{message.id}" class="block mb-1 text-sm font-medium text-gray-700">
        Content&nbsp;Type:
      </label>
      <select
        id="type-{message.id}"
        class="w-full px-3 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
        value={message.contentType || 'text'}
        on:change={handleTypeChange}
      >
        <option value="text">Text</option>
        <option value="chart">Chart</option>
      </select>
    </div>
  
    <!-- ─────────────────────── CONTENT EDITOR ─────────────────────── -->
    {#if message.contentType === 'chart'}
      <ChartContentEditor bind:chartData={message.chartData} {updateStore} />
    {:else}
      <TextContentEditor bind:text={message.text} {updateStore} />
    {/if}
  
    <!-- ─────────────────────── REACTION BADGE / ADD REACTION ─────────────────────── -->
    <div class="mt-2 flex items-center gap-2">
        {#if message.reaction}
        <!-- Current reaction shown + pencil icon to edit -->
        <span class="reaction-badge inline-flex items-center bg-gray-200 px-2 py-1 rounded-full text-xs">
            <span class="mr-1">{message.reaction}</span>
    
            <button
            type="button"
            class="icon-btn text-gray-600 hover:text-gray-800"
            aria-label="Edit reaction"
            on:click={onOpenEmojiPicker}
            >
            <!-- heroicons‑outline: pencil-square -->
            <svg
                class="icon w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M16.862 3.487a2.5 2.5 0 0 1 3.536 3.536L9.5 18.922l-4.24.707.707-4.24 10.895-10.902Z"/>
                <path d="M19 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>
            </svg>
            </button>
        </span>
        {:else}
        <!-- No reaction yet → “Add Reaction” button with smiley outline -->
        <button
            type="button"
            class="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200
                px-2 py-1 rounded-full transition-colors"
            aria-label="Add reaction"
            on:click={onOpenEmojiPicker}
        >
            <!-- heroicons‑outline: face-smile -->
            <svg
            class="icon w-4 h-4 text-yellow-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            >
            <circle cx="12" cy="12" r="9" />
            <path d="M15 13a3 3 0 0 1-6 0" />
            <circle cx="9"  cy="9" r="1.5" />
            <circle cx="15" cy="9" r="1.5" />
            </svg>
            <span>Add Reaction</span>
        </button>
        {/if}
    </div>  
  
    <!-- ───────────── DROP INDICATOR (during drag) ───────────── -->
    {#if dragOverIndex === index && draggedIndex !== index}
      <div class="drop-indicator" />
    {/if}
  </div>
  
  <!-- ───────────────────────── LOCAL STYLES ───────────────────────── -->
  <style>
    /* ───────────── Drag‑handle & card effects ───────────── */
  
    /* highlight target card while dragging over it */
    .message-card :global(.drag-over) {
      border-color: #4f46e5;                           /* indigo‑600 */
      box-shadow: 0 0 0 2px rgba(79, 70, 229, .30);
    }
  
    /* muted appearance for the card being dragged */
    .message-card :global(.dragging) {
      opacity: .6;
      box-shadow: 0 0 10px rgba(0, 0, 0, .10);
    }
  
    /* blue bar that appears where the card will drop */
    .drop-indicator {
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #4f46e5;                       /* indigo‑600 */
      z-index: 10;
    }
  
    /* subtle hover for the reaction badge */
    .reaction-badge:hover {
      background-color: #e5e7eb;                       /* gray‑200 */
    }
  </style>