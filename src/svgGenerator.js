/* -------------------------------------------------------------------------
 * svgGenerator.js — Generate a chat‑style SVG for your dynamic GitHub README
 * -------------------------------------------------------------------------
 * ▸ Features
 *   – Alternating “you vs. them” bubbles with subtle slide‑in animation
 *   – Automatic word‑wrap & width‑clamp so long lines never overflow
 *   – Layout engine that stacks messages vertically with uniform gaps
 *   – Pure SVG → renders everywhere GitHub markdown is supported
 *
 * Add/replace the long “src: url() …” line for the Inter font where noted.
 * ---------------------------------------------------------------------- */

/* eslint-disable no-multi-str */

// ──────────────────────────────────────────────────────────────────────────
//  📐 Layout constants
// ──────────────────────────────────────────────────────────────────────────
const SVG_WIDTH                = 550;                  // px – fixed width frame
const MIN_BUBBLE_WIDTH         = 120;                  // px – don’t get skinnier
const MAX_BUBBLE_PX            = SVG_WIDTH * 0.80;     // px – 80% max width
const PADDING_X                = 16;                   // px – inner‑bubble x pad
const PADDING_Y                = 12;                   // px – inner‑bubble y pad
const BUBBLE_RADIUS            = 18;                   // px – rounded corner rad
const AVG_CHAR_WIDTH           = 7.2;                  // px – heuristic per char
const LINE_HEIGHT              = 20;                   // px – baseline‑to‑baseline
const MESSAGE_GAP              = 28;                   // px – space between msgs
const MESSAGE_REVEAL_DURATION  = 0.45;                 // s  – slide‑in animation

//  Approx chars per wrapped line once we honour padding & width clamp
const MAX_CHARS = Math.floor((MAX_BUBBLE_PX - PADDING_X * 2) / AVG_CHAR_WIDTH);

// ──────────────────────────────────────────────────────────────────────────
//  🛠️ Utility helpers
// ──────────────────────────────────────────────────────────────────────────
function wrapLines(paragraph) {
  const words     = paragraph.split(/\s+/);
  const outLines  = [];
  let   lineBuf   = '';

  for (const w of words) {
    const probe = lineBuf ? `${lineBuf} ${w}` : w;
    if (probe.length > MAX_CHARS) {
      outLines.push(lineBuf);
      lineBuf = w;
    } else {
      lineBuf = probe;
    }
  }
  if (lineBuf) outLines.push(lineBuf);
  return outLines;
}

function calculateTextLayout(raw) {
  const lines = raw.split(/\n/).map(wrapLines).flat();

  const maxLineChars = Math.max(...lines.map(l => l.length));
  const bubbleWidth  = Math.min(
    MAX_BUBBLE_PX,
    Math.max(MIN_BUBBLE_WIDTH, maxLineChars * AVG_CHAR_WIDTH + PADDING_X * 2)
  );
  const bubbleHeight = lines.length * LINE_HEIGHT + PADDING_Y * 2;

  return { lines, bubbleWidth, bubbleHeight };
}

// ──────────────────────────────────────────────────────────────────────────
//  🎨 SVG builders
// ──────────────────────────────────────────────────────────────────────────
function createMessageElement(msg, x, y, delay) {
  const { lines, bubbleWidth, bubbleHeight } = calculateTextLayout(msg.text);

  const bubbleClass = msg.isSelf ? 'bubble--self'  : 'bubble--other';
  const textClass   = msg.isSelf ? 'text--self'    : 'text--other';
  const textAnchor  = msg.isSelf ? 'end'           : 'start';
  const tailSide    = msg.isSelf ? 'right'         : 'left';

  const tailPath = tailSide === 'right'
    ? `M ${bubbleWidth} ${bubbleHeight - 12} l 10 12 h -10 Z`
    : `M 0 ${bubbleHeight - 12} l -10 12 v -12 Z`;

  const tspans = lines.map((l, i) =>
    `      <tspan x="${msg.isSelf ? bubbleWidth - PADDING_X : PADDING_X}" dy="${i === 0 ? 0 : LINE_HEIGHT}">${l}</tspan>`).join('\n');

  return `
  <g class="message-bubble ${bubbleClass}" style="--tx:${x}px; --ty:${y}px; animation-delay:${delay}s">
    <path class="bubble-rect" d="M 0 0 h ${bubbleWidth} a ${BUBBLE_RADIUS} ${BUBBLE_RADIUS} 0 0 1 ${BUBBLE_RADIUS} ${BUBBLE_RADIUS} v ${bubbleHeight - BUBBLE_RADIUS * 2} a ${BUBBLE_RADIUS} ${BUBBLE_RADIUS} 0 0 1 -${BUBBLE_RADIUS} ${BUBBLE_RADIUS} h -${bubbleWidth - BUBBLE_RADIUS * 2} a ${BUBBLE_RADIUS} ${BUBBLE_RADIUS} 0 0 1 -${BUBBLE_RADIUS} -${BUBBLE_RADIUS} v -${bubbleHeight - BUBBLE_RADIUS * 2} a ${BUBBLE_RADIUS} ${BUBBLE_RADIUS} 0 0 1 ${BUBBLE_RADIUS} -${BUBBLE_RADIUS} Z"/>
    <path class="bubble-tail" d="${tailPath}"/>
    <text class="${textClass}" text-anchor="${textAnchor}" y="${PADDING_Y + 15}">
${tspans}
    </text>
  </g>`;
}

function createTypingIndicator(x, y, delay) {
  return `
  <g class="typing-indicator" style="--tx:${x}px; --ty:${y}px; animation-delay:${delay}s">
    <circle cx="4"  cy="4" r="4" />
    <circle cx="20" cy="4" r="4" />
    <circle cx="36" cy="4" r="4" />
  </g>`;
}

// ──────────────────────────────────────────────────────────────────────────
//  🧩 generateSvg — public API
// ──────────────────────────────────────────────────────────────────────────
function generateSvg(messages) {
  let yCursor = 0;
  let body    = '';

  messages.forEach((m, idx) => {
    const delay = idx * 0.3;

    if (m.typing) {
      const x = m.isSelf ? SVG_WIDTH - 64 : 0;
      body   += createTypingIndicator(x, yCursor, delay);
      yCursor += 20 + MESSAGE_GAP;
      return;
    }

    const { bubbleWidth, bubbleHeight } = calculateTextLayout(m.text);
    const x = m.isSelf ? SVG_WIDTH - bubbleWidth : 0;
    body   += createMessageElement(m, x, yCursor, delay);
    yCursor += bubbleHeight + MESSAGE_GAP;
  });

  const svgHeight = yCursor || 40;

  return `<svg width="${SVG_WIDTH}" height="${svgHeight}" viewBox="0 0 ${SVG_WIDTH} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" role="img" fill="none">
  <style>
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url(data:application/font-woff2;charset=utf-8;base64,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) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    text {
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: ${LINE_HEIGHT}px;
      white-space: pre;
      dominant-baseline: hanging;
    }

    /* *****  Bubble base *************************************************** */
    .message-bubble {
      transform: translate(var(--tx), calc(var(--ty) + 10px));
      opacity: 0;
      animation: msg-reveal ${MESSAGE_REVEAL_DURATION}s ease-out forwards;
    }

    @keyframes msg-reveal {
      to { transform: translate(var(--tx), var(--ty)); opacity: 1; }
    }

    .bubble-rect, .bubble-tail { fill: var(--bubble-fill, #000); }
    .bubble--self  { --bubble-fill: #0d6efd; }
    .bubble--other { --bubble-fill: #2b2b2b; }

    .text--self  { fill: #fff; }
    .text--other { fill: #fff; }

    /* *****  Typing indicator ********************************************* */
    .typing-indicator {
      transform: translate(var(--tx), calc(var(--ty) + 10px));
      opacity: 0;
      animation: msg-reveal ${MESSAGE_REVEAL_DURATION}s ease-out forwards;
    }
    .typing-indicator circle {
      fill: #2b2b2b;
      animation: blink 1s ease-in-out infinite;
    }
    .typing-indicator circle:nth-child(2){ animation-delay: 0.15s; }
    .typing-indicator circle:nth-child(3){ animation-delay: 0.30s; }

    @keyframes blink { 0%,80%,100%{opacity:0.25;} 40%{opacity:1;} }
  </style>
${body}
</svg>`;
}

// ──────────────────────────────────────────────────────────────────────────
//  🌍 Exports (ESM & CJS compatible)
// ──────────────────────────────────────────────────────────────────────────
export { generateSvg };
export const generateSVG = generateSvg; // alias for legacy import

// Allow CommonJS "require" if needed
if (typeof module !== 'undefined') {
  module.exports = { generateSvg, generateSVG: generateSvg };
}