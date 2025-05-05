/**
 * ProfileChatter – SVG Chat Visualization Generator
 * -------------------------------------------------
 * Main entry for building the SVG.  Run with:
 *   node src/main.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateSvg }  from './svgGenerator.js';   // alias generateSVG also exists
import { getDynamicData } from './dynamicData.js'; // <-- your data helper

// ————————————————————————————————————————————————————————————————
//  Path helpers
// ————————————————————————————————————————————————————————————————
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataPath   = path.join(__dirname, '..', 'data', 'chatData.json');
const distDir    = path.join(__dirname, '..', 'dist');
const outputPath = path.join(distDir, 'profile-chat.svg');

// ————————————————————————————————————————————————————————————————
//  tiny helper – replace {placeholders} with ctx[key] if present
// ————————————————————————————————————————————————————————————————
function interpolate(text, ctx) {
  return text.replace(/\{(.*?)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(ctx, key) ? ctx[key] : `{${key}}`
  );
}

// ————————————————————————————————————————————————————————————————
//  Main
// ————————————————————————————————————————————————————————————————
async function main() {
  try {
    // 1️⃣ fetch any dynamic values (date, weather, GitHub stats, …)
    const dynamic = await getDynamicData();

    // 2️⃣ load static chat template
    const chatJson = await fs.readFile(dataPath, 'utf8');
    const chatData = JSON.parse(chatJson);

    // 3️⃣ merge → final messages array for the SVG engine
    const messages = chatData.map(msg => ({
      text  : interpolate(msg.text, dynamic),
      isSelf: msg.sender === 'me',
      typing: msg.typing ?? false,
    }));

    // 4️⃣ generate & save SVG
    const svg = generateSvg(messages);

    await fs.mkdir(distDir, { recursive: true });
    await fs.writeFile(outputPath, svg, 'utf8');

    console.log(`✅  SVG successfully generated → ${outputPath}`);
  } catch (err) {
    console.error('❌  Error generating SVG:', err);
    process.exit(1);
  }
}

main();
