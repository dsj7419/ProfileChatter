// scripts/build-profile.js
import fs from 'node:fs';
import { generateChatSVG } from '../src/main.js';
fs.writeFileSync('dist/profile-chat.svg', generateChatSVG());
