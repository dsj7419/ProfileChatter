// configurator-ui/server/previewServer.js
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

// Calculate base paths for imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');

// Log paths for debugging
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Project root:', projectRoot);

// Check the expected file path
const profileChatterPath = join(projectRoot, 'src', 'ProfileChatter.js');
console.log('Looking for ProfileChatter.js at:', profileChatterPath);

// Verify file exists
if (!existsSync(profileChatterPath)) {
  console.error(`Error: File not found at ${profileChatterPath}`);
  process.exit(1);
}

// Import the main ProfileChatter SVG generator
let generateChatSVG;
try {
  // Import using the proper file path - convert to URL format
  const profileChatterUrl = `file://${profileChatterPath.replace(/\\/g, '/')}`;
  console.log('Loading module from URL:', profileChatterUrl);
  
  const profileChatterModule = await import(profileChatterUrl);
  generateChatSVG = profileChatterModule.generateChatSVG;
  console.log('Successfully imported generateChatSVG function');
} catch (error) {
  console.error('Error importing ProfileChatter module:', error);
  process.exit(1);
}

const PORT = 3001;

// Debugging: log request information
function logRequest(req) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Don't log entire headers for cleaner output
  const headersToLog = {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'origin': req.headers['origin'],
    'referer': req.headers['referer']
  };
  
  console.log('Headers:', headersToLog);
}

// Helper to parse JSON safely
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`));
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Log all requests for debugging
    logRequest(req);
    
    // Set CORS headers to allow requests from the Vite dev server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      res.statusCode = 204;
      res.end();
      return;
    }
    
    // Basic homepage for direct browser access
    if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
      console.log('Serving homepage');
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <html>
          <head><title>ProfileChatter Preview Server</title></head>
          <body>
            <h1>ProfileChatter Preview Server</h1>
            <p>Server is running. Use POST to /generate-preview to generate SVG previews.</p>
            <p>Testing with cURL:</p>
            <pre>curl -X POST -H "Content-Type: application/json" -d '{"profile":{"NAME":"Test User"},"activeTheme":"ios","chatMessages":[{"id":"1","sender":"me","text":"Hello"}]}' http://localhost:3001/generate-preview</pre>
          </body>
        </html>
      `);
      return;
    }
    
    // Handle POST requests to /generate-preview with more flexible path matching
    const isGeneratePreview = req.method === 'POST' && 
                             (req.url === '/generate-preview' || 
                              req.url === '/generate-preview/' ||
                              req.url.startsWith('/generate-preview?'));
    
    if (isGeneratePreview) {
      console.log('Handling POST request to /generate-preview');
      
      try {
        // Parse the JSON body
        const configData = await parseJsonBody(req);
        console.log('Parsed JSON data with keys:', Object.keys(configData));
        
        // Validate the required configuration properties
        if (!configData.profile || !configData.activeTheme || !Array.isArray(configData.chatMessages)) {
          console.error('Invalid configuration data received');
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: 'Invalid configuration data. Must include profile, activeTheme, and chatMessages array.',
            received: {
              hasProfile: !!configData.profile,
              activeTheme: configData.activeTheme,
              chatMessagesIsArray: Array.isArray(configData.chatMessages),
              chatMessagesLength: Array.isArray(configData.chatMessages) ? configData.chatMessages.length : 'N/A'
            }
          }));
          return;
        }
        
        // Extract work start date from the received profile
        const workStartDate = configData.profile.WORK_START_DATE;
        const workStartObj = workStartDate ? { ...workStartDate } : null;
        delete configData.profile.WORK_START_DATE; // Remove from profile since it's handled separately
        
        // Prepare custom context for SVG generation
        const customContext = {
          profile: configData.profile,
          activeTheme: configData.activeTheme,
          // Pass chat messages separately - they'll be handled by modified TimelineBuilder
          chatMessages: configData.chatMessages,
          // If we have work start date components, recreate the date
          workStartDate: workStartObj ? new Date(workStartObj.year, workStartObj.month - 1, workStartObj.day) : null,
          // Include avatar configuration if provided
          avatars: configData.avatars
        };
        
        // Log avatar configuration if present
        if (customContext.avatars) {
          console.log('Avatar configuration received:', {
            enabled: customContext.avatars.enabled,
            shape: customContext.avatars.shape,
            hasMeConfig: !!customContext.avatars.me,
            hasVisitorConfig: !!customContext.avatars.visitor
          });
        }
        
        console.log('Generating SVG with custom context...');
        console.log('Profile:', JSON.stringify(customContext.profile).substring(0, 100) + '...');
        console.log('Theme:', customContext.activeTheme);
        console.log('Chat messages count:', customContext.chatMessages.length);
        console.log('Work start date:', customContext.workStartDate);
        
        // Generate SVG
        const svgMarkup = await generateChatSVG(customContext);
        console.log('SVG generated, length:', svgMarkup.length);
        
        // Send SVG response
        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        res.end(svgMarkup);
        console.log('SVG sent successfully');
        
      } catch (error) {
        console.error('Error processing request:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Error generating SVG: ${error.message}` }));
      }
    } else {
      // Handle invalid endpoints
      console.log('Invalid endpoint requested:', req.method, req.url);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint not found', method: req.method, url: req.url }));
    }
  } catch (serverError) {
    // Catch-all error handler
    console.error('Unhandled server error:', serverError);
    try {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } catch (responseError) {
      console.error('Error sending error response:', responseError);
    }
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
  console.log(`Serving /generate-preview endpoint for SVG generation`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down preview server...');
  server.close(() => {
    console.log('Preview server stopped');
    process.exit(0);
  });
});

// Add unhandled rejection handler
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});