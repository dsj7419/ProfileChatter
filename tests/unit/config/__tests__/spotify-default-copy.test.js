import { describe, it, expect } from 'vitest'

import { config } from '../../../../src/config/config.js'

/**
 * When Spotify is unconfigured (intentional skip) or nothing is playing, the
 * `{spotifyTrack}` placeholder falls back to `apiDefaults.SPOTIFY_NOW_PLAYING`.
 * The default chat copy embeds it mid-sentence — "I code to {spotifyTrack} — it
 * really fuels my focus!" — so the default must read as a noun phrase, not a
 * standalone sentence (which produced the awkward "I code to Not currently
 * listening to music. — it really fuels my focus!").
 */
describe('Spotify-skip default copy', () => {
  const render = (v) => `I code to ${v} — it really fuels my focus!`

  it('flows naturally in the default template when Spotify is unconfigured', () => {
    const v = config.apiDefaults.SPOTIFY_NOW_PLAYING

    // A mid-sentence phrase: lowercase-initial, no trailing period.
    expect(v[0]).toBe(v[0].toLowerCase())
    expect(v).not.toMatch(/\.$/)

    const rendered = render(v)
    // No sentence break (period) before the em-dash clause.
    expect(rendered).not.toMatch(/\.\s+—/)
    expect(rendered).not.toContain('I code to Not currently')
  })
})
