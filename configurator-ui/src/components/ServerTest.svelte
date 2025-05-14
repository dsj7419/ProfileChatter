// configurator-ui/src/components/ServerTest.svelte

<script>
  import { onMount } from 'svelte';
  
  let testResult = '';
  let isLoading = false;
  let previewServer = 'http://localhost:3001';
  let svgResult = '';
  
  onMount(() => {
    console.log('ServerTest component mounted');
  });
  
  // Simple test to check server connectivity
  async function testServerConnection() {
    isLoading = true;
    testResult = 'Testing server connection...';
    
    try {
      const response = await fetch(`${previewServer}/test`);
      const data = await response.json();
      
      testResult = `Server connection successful!\nResponse: ${JSON.stringify(data, null, 2)}`;
      return true;
    } catch (error) {
      testResult = `Error connecting to server: ${error.message}`;
      return false;
    } finally {
      isLoading = false;
    }
  }
  
  // Test basic SVG generation
  async function testSvgGeneration() {
    isLoading = true;
    svgResult = '';
    testResult = 'Testing SVG generation...';
    
    try {
      // Use a very simple payload for testing
      const simplePayload = {
        profile: { 
          NAME: "Test User",
          PROFESSION: "Developer",
          LOCATION: "Test City",
          COMPANY: "Test Company",
          CURRENT_PROJECT: "Testing",
          GITHUB_USERNAME: "testuser"
        },
        activeTheme: "ios",
        chatMessages: [
          { id: "test-1", sender: "me", text: "Hello from test" },
          { id: "test-2", sender: "visitor", text: "Hello back!" }
        ]
      };
      
      const response = await fetch(`${previewServer}/generate-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simplePayload)
      });
      
      if (!response.ok) {
        let errorText = 'SVG generation failed';
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorText;
        } catch (e) {
          errorText = `${errorText}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }
      
      const svgText = await response.text();
      testResult = `SVG generation successful! Received ${svgText.length} characters.`;
      svgResult = svgText;
      return true;
    } catch (error) {
      testResult = `Error generating SVG: ${error.message}`;
      return false;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="server-test-container">
  <h2>Server Connection Test</h2>
  
  <div class="buttons">
    <button on:click={testServerConnection} disabled={isLoading}>
      Test Server Connection
    </button>
    
    <button on:click={testSvgGeneration} disabled={isLoading}>
      Test SVG Generation
    </button>
  </div>
  
  <div class="result-panel">
    <pre>{testResult}</pre>
  </div>
  
  {#if svgResult}
    <div class="svg-preview">
      <h3>SVG Preview</h3>
      <div class="svg-content">
        {@html svgResult}
      </div>
    </div>
  {/if}
</div>

<style>
  .server-test-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
  }
  
  .buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  button {
    padding: 10px 15px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #4338ca;
  }
  
  button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  .result-panel {
    padding: 15px;
    background-color: #f9fafb;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    margin-bottom:.20px;
    min-height: 50px;
    max-height: 200px;
    overflow: auto;
  }
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
  }
  
  .svg-preview {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }
  
  .svg-content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: #f9fafb;
    border-radius: 4px;
  }
  
  :global(.svg-content svg) {
    max-width: 100%;
    height: auto;
  }
</style>