<script context="module" lang="ts">
  /**
   * File: src/lib/ui/Tooltip.svelte
   * A11y‑friendly, adaptive tooltip component.
   */
  export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
</script>

<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  /** Tooltip text (plain‑text, not HTML). */
  export let text: string = '';
  /** Preferred position; flips automatically if there is no room. */
  export let position: TooltipPosition = 'top';
  /** Optional open / close delays (ms). */
  export let openDelay = 0;
  export let closeDelay = 0;

  /* --------------------------------------------------------------------- */
  /* Internal state                                                         */
  /* --------------------------------------------------------------------- */
  let tooltipVisible = false;
  let tooltipElement: HTMLDivElement | null = null;
  let triggerElement: HTMLElement | null = null;
  let adjustedPosition: TooltipPosition = position;

  const VIEWPORT_MARGIN = 10;
  const tooltipId = `tooltip-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

  const dispatch = createEventDispatcher<{ show: void; hide: void }>();

  let openTimeout: ReturnType<typeof setTimeout> | null = null;
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  /* --------------------------------------------------------------------- */
  /* Lifecycle                                                              */
  /* --------------------------------------------------------------------- */
  onMount(() => {
    triggerElement = tooltipElement?.parentElement ?? null;
  });

  onDestroy(() => {
    if (openTimeout) clearTimeout(openTimeout);
    if (closeTimeout) clearTimeout(closeTimeout);
  });

  /* --------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* --------------------------------------------------------------------- */
  async function calculatePosition() {
    if (!tooltipElement || !triggerElement) return;
    await tick();

    const triggerRect = triggerElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    adjustedPosition = position; // reset to requested

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (position === 'top' && triggerRect.top < tooltipRect.height + VIEWPORT_MARGIN) {
      adjustedPosition = 'bottom';
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + VIEWPORT_MARGIN > vh) {
      adjustedPosition = 'top';
    } else if (position === 'left' && triggerRect.left < tooltipRect.width + VIEWPORT_MARGIN) {
      adjustedPosition = 'right';
    } else if (position === 'right' && triggerRect.right + tooltipRect.width + VIEWPORT_MARGIN > vw) {
      adjustedPosition = 'left';
    }
  }

  function delayedShow() {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    openTimeout = setTimeout(async () => {
      tooltipVisible = true;
      await calculatePosition();
      dispatch('show');
    }, openDelay);
  }

  function delayedHide() {
    if (openTimeout) {
      clearTimeout(openTimeout);
      openTimeout = null;
    }
    closeTimeout = setTimeout(() => {
      tooltipVisible = false;
      dispatch('hide');
    }, closeDelay);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      delayedHide();
      triggerElement?.focus();
    }
  }
</script>

<!-- Trigger wrapper -->
<span
  class="tooltip-trigger inline-flex items-center"
  role="button"
  tabindex="0"
  aria-haspopup="true"
  aria-describedby={tooltipVisible ? tooltipId : undefined}
  on:mouseenter={delayedShow}
  on:mouseleave={delayedHide}
  on:focus={delayedShow}
  on:blur={delayedHide}
  on:keydown={handleKeydown}
>
  <!-- Visual trigger comes from parent component via slot -->
  <slot {tooltipId}></slot>

  {#if tooltipVisible}
    <div
      bind:this={tooltipElement}
      id={tooltipId}
      role="tooltip"
      transition:fade={{ duration: 150 }}
      class="tooltip absolute z-[1000] select-none pointer-events-none whitespace-normal
             rounded-md bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-md
             max-w-[250px] min-w-[150px]"
      class:tooltip-top={adjustedPosition === 'top'}
      class:tooltip-bottom={adjustedPosition === 'bottom'}
      class:tooltip-left={adjustedPosition === 'left'}
      class:tooltip-right={adjustedPosition === 'right'}
    >
      {text}
      <div class="tooltip-arrow {adjustedPosition === 'top'    ? 'arrow-down'  : ''}
                               {adjustedPosition === 'bottom' ? 'arrow-up'    : ''}
                               {adjustedPosition === 'left'   ? 'arrow-right' : ''}
                               {adjustedPosition === 'right'  ? 'arrow-left'  : ''}"></div>
    </div>
  {/if}
</span>

<style>
  .tooltip-trigger { position: relative; }

  /* Position classes */
  .tooltip-top    { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 5px; }
  .tooltip-bottom { top: 100%;    left: 50%; transform: translateX(-50%); margin-top:    5px; }
  .tooltip-left   { right: 100%;  top: 50%;  transform: translateY(-50%); margin-right:  5px; }
  .tooltip-right  { left: 100%;   top: 50%;  transform: translateY(-50%); margin-left:   5px; }

  /* Arrow */
  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 5px solid transparent;
  }
  .arrow-down  { bottom: -5px; left: 50%; transform: translateX(-50%); border-top-color: #1f2937; border-bottom: 0; }
  .arrow-up    { top: -5px;    left: 50%; transform: translateX(-50%); border-bottom-color: #1f2937; border-top:    0; }
  .arrow-right { right: -5px;   top: 50%; transform: translateY(-50%); border-left-color: #1f2937; border-right:  0; }
  .arrow-left  { left: -5px;    top: 50%; transform: translateY(-50%); border-right-color: #1f2937; border-left:   0; }
</style>