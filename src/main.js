/**
 * ProfileChatter - SVG Chat Visualization Generator
 * 
 * Main entry point for the SVG generation script.
 * This file handles importing data and coordinating the SVG generation process.
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateSVG } from './svgGenerator.js'

// Get directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Paths
const dataPath = path.join(__dirname, '..', 'data', 'chatData.json')
const distDir = path.join(__dirname, '..', 'dist')
const outputPath = path.join(distDir, 'profile-chat.svg')

async function main() {
  try {
    // Read and parse chat data
    const chatDataRaw = await fs.readFile(dataPath, 'utf8')
    const chatData = JSON.parse(chatDataRaw)
    
    // Generate SVG string from chat data
    const svgString = generateSVG(chatData)
    
    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true })
    
    // Write SVG to output file
    await fs.writeFile(outputPath, svgString)
    
    console.log(`SVG successfully generated at ${outputPath}`)
  } catch (error) {
    console.error('Error generating SVG:', error)
    process.exit(1)
  }
}

main()