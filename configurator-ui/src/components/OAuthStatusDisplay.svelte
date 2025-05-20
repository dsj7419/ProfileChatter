<!-- configurator-ui/src/components/OAuthStatusDisplay.svelte -->
<script>
    export let providerName;
    export let status = {};
  </script>
  
  <div class="flex items-center justify-between py-2">
    <span class="font-medium">{providerName}</span>
    {#if status?.error}
      <span class="text-red-600 text-sm">Error – {status.error}</span>
    {:else if status?.authenticated}
      {#if status.valid}
        <span class="text-green-600 text-sm">
          Connected
          {#if status.expiresIn != null}
            (expires in {Math.floor(status.expiresIn / 60)} min)
          {/if}
        </span>
      {:else}
        <span class="text-yellow-600 text-sm">Token expired</span>
      {/if}
    {:else}
      <span class="text-gray-500 text-sm">Not connected</span>
    {/if}
  </div>