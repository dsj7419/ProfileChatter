<script>
    import { onMount, onDestroy } from 'svelte';
    import { placeholderData } from '../stores/configStore.js';
    import PlaceholderSelector from './PlaceholderSelector.svelte';
  
    /* props */
    export let text = '';
    export let updateStore;
  
    /* state */
    let textarea;
    let showSelector = false;
    let startIdx = -1;        // index of the triggering "{"
    let filter = '';
  
    /* anchor that Popper/PlaceholderSelector targets */
    let anchor = null;
  
    /* ───────────────────────── helpers ───────────────────────── */
  
    /** create an invisible fixed‑position anchor below the "{" */
    function ensureAnchor() {
      if (anchor) return;
      anchor = document.createElement('div');
      Object.assign(anchor.style, {
        position: 'fixed',
        width: '0',
        height: '0',
        pointerEvents: 'none',
        zIndex: '9999'          // above scroll containers
      });
      document.body.appendChild(anchor);
    }
    
    function removeAnchor() {
      if (anchor) {
        document.body.removeChild(anchor);
        anchor = null;
      }
    }
  
    /** mirror‑div technique to find caret pixel coords */
    function caretCoords(el, idx) {
      const s = getComputedStyle(el);
      const div = document.createElement('div');
  
      [
        'boxSizing','width','fontSize','fontFamily','fontWeight','fontStyle','letterSpacing',
        'textTransform','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
        'paddingTop','paddingRight','paddingBottom','paddingLeft','lineHeight','textAlign'
      ].forEach(p => div.style[p] = s[p]);
  
      Object.assign(div.style, {
        position: 'fixed',       // viewport coordinates
        top: '0',
        left: '0',
        visibility: 'hidden',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      });
  
      div.textContent = el.value.slice(0, idx);
      const span = document.createElement('span');
      span.textContent = '\u200b';
      div.appendChild(span);
  
      document.body.appendChild(div);
      const rect = span.getBoundingClientRect();
      document.body.removeChild(div);
      return { x: rect.left, y: rect.bottom };
    }
  
    function placeAnchor() {
      if (!anchor || startIdx === -1) return;
      const { x, y } = caretCoords(textarea, startIdx);
      anchor.style.left = `${x}px`;
      anchor.style.top  = `${y}px`;
    }
  
    function autoResize() {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  
    function closeSelector() {
      showSelector = false;
      startIdx = -1;
      filter = '';
      removeAnchor();
      updateStore(); // Ensure update after closing
    }
  
    /* ───────────────────────── event handlers ───────────────────────── */
  
    /** recalc or close when caret moves without text input */
    function refreshContext() {
      if (!showSelector) return;
      const pos = textarea.selectionStart;
      if (pos <= startIdx) { closeSelector(); return; }
      filter = text.slice(startIdx + 1, pos);
      placeAnchor();
    }
  
    function onInput() {
      autoResize();
  
      const pos = textarea.selectionStart;
      const ch  = text[pos - 1];
  
      /* open */
      if (ch === '{' && !showSelector) {
        showSelector = true;
        startIdx = pos - 1;
        filter = '';
        ensureAnchor();
        placeAnchor();
        updateStore();      // reactive preview
        return;
      }
  
      if (showSelector) {
        if (ch === '}' || ch === ' ') { 
          closeSelector(); 
          updateStore();    // ensure update after closing
        }
        else refreshContext();
      }
  
      // Always update store on input to keep preview live
      updateStore();        
    }
  
    function onKeydown(e) {
      if (showSelector && e.key === 'Escape') { 
        closeSelector(); 
        return;
      }
  
      if (
        showSelector &&
        ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)
      ) queueMicrotask(() => {
        refreshContext();
        updateStore(); // Ensure update after context refresh
      });
  
      if (showSelector && e.key === 'Backspace')
        queueMicrotask(() => {
          if (textarea.selectionStart <= startIdx) closeSelector();
          else {
            refreshContext();
            updateStore(); // Ensure update after context refresh
          }
        });
    }
  
    function onClick() { 
      if (showSelector) {
        queueMicrotask(() => {
          refreshContext();
          updateStore(); // Ensure update after refreshing context
        });
      }
    }
  
    /* insertion */
    function onSelect(e) {
      const placeholder = e.detail;
      const caretEnd    = textarea.selectionStart;
  
      text = text.slice(0, startIdx) + placeholder + text.slice(caretEnd);
      const newPos = startIdx + placeholder.length;
  
      closeSelector();
      /* re‑focus & caret */
      queueMicrotask(() => {
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
        
        // Extra call to ensure update is propagated
        updateStore();
        autoResize();
      });
    }
  
    /* outside click */
    function onDocClick(ev) {
      if (
        !showSelector ||
        textarea.contains(ev.target) ||
        document.querySelector('.placeholder-selector')?.contains(ev.target)
      ) return;
      closeSelector();
      updateStore(); // Ensure update after closing
    }
  
    onMount(() => document.addEventListener('click', onDocClick));
    onDestroy(() => {
      document.removeEventListener('click', onDocClick);
      removeAnchor();
    });
  </script>
  
  <div class="relative">
    <textarea
      bind:this={textarea}
      bind:value={text}
      class="w-full p-3 bg-gray-50 border border-gray-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] transition-colors duration-200"
      rows={Math.max(3, (text?.match(/\n/g) || []).length + 1)}
      placeholder="Enter message text..."
      on:input={onInput}
      on:keydown={onKeydown}
      on:click={onClick}
    ></textarea>
  
    <div class="absolute top-1 right-2">
      <span class="text-xs text-gray-400 bg-gray-50 px-1">Edit</span>
    </div>
  
    <PlaceholderSelector
      placeholders={$placeholderData}
      filterText={filter}
      targetElement={anchor ?? textarea}
      isVisible={showSelector}
      on:select={onSelect}
      on:close={closeSelector}
      class="placeholder-selector"
    />
  </div>
  
  <style>
    textarea {
      overflow-y: hidden;
    }
  </style>