/**
 * spotifyAuthRoutes.js
 * Express routes for handling Spotify OAuth flow
 */
import express from 'express';
import { getAuthorizationUrl, exchangeCodeForTokens } from '../services/auth/spotifyOAuthService.js';

const router = express.Router();

// Route to initiate OAuth flow
router.get('/auth/spotify', (req, res) => {
  const authUrl = getAuthorizationUrl();
  res.redirect(authUrl);
});

// Callback route that Spotify will redirect to
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }
  
  try {
    await exchangeCodeForTokens(code);
    res.send('Authentication successful! You can now close this window and restart the application.');
  } catch (error) {
    console.error('Error during Spotify authorization:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

export default router;