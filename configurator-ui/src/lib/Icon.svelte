<script lang="ts">
    /**
     * Generic outline icon wrapper.
     *
     * Any attribute you pass (class, style, id, aria‑*, …) is forwarded
     * to the <svg> via ...$$restProps.
     */
    export let viewBox: string = '0 0 24 24';
  
    // Optional: override the default stroke‑width
    export let strokeWidth: number | string = 2;
  
    // Forward all other props (including `class`) with $$restProps
    // – no need to declare a `className` prop manually.
  </script>
  
  <svg
    {viewBox}
    class="icon"
    fill="none"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    {...$$restProps}
  >
    <slot />
  </svg>
  