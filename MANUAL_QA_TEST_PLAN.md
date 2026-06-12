# Manual QA Test Plan - ProfileChatter V2

## Introduction

This test plan provides a comprehensive manual verification process for the core functionality of ProfileChatter V2, specifically focusing on the Configurator UI and its interaction with the SVG generation backend. The objective is to ensure that all critical user flows, data persistence, and integration points function correctly before release.

**Target Environment:** Local development setup using `npm run config:dev`

## Prerequisites/Setup

Before beginning testing, ensure the following setup is complete:

1. **Repository Setup:**
   - ProfileChatter repository cloned locally
   - `npm install` completed successfully
   - Node.js version 20.x or higher

2. **Environment Configuration:**
   - `.env` file configured with necessary API keys:
     - GitHub OAuth credentials (for GitHub integration testing)
     - Spotify OAuth credentials (for Spotify integration testing)
     - WakaTime API key (for WakaTime chart testing, optional)
   - Optional: Delete existing `profileChatterConfig.json` to test default loading

3. **Application Startup:**
   - Run `npm run config:dev` to start both Configurator UI and Preview Server
   - Verify both services are running without errors
   - Navigate to the Configurator UI (typically <http://localhost:5173>)

## Test Case Structure

Each test case follows this format:

- **Test Case ID:** Unique identifier (e.g., TC-PROF-001)
- **Feature/Component:** Area being tested
- **Test Objective:** Brief description of what is being verified
- **Test Steps:** Numbered, actionable steps
- **Expected Result:** What should happen if the test passes
- **Actual Result:** [To be filled by tester: Pass/Fail]
- **Notes/Bug ID:** [For tester's comments or bug references]

---

## Test Areas & Scenarios

### A. Configurator UI - Initial Load & Default State

#### TC-INIT-001

- **Feature/Component:** Initial Application Load
- **Test Objective:** Verify UI loads correctly with proper default state
- **Test Steps:**
  1. Start application with `npm run config:dev`
  2. Navigate to Configurator UI in browser
  3. Observe initial page load and UI rendering
- **Expected Result:** UI loads without errors, all components visible, no console errors
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-INIT-002

- **Feature/Component:** Default Configuration Loading
- **Test Objective:** Verify initial config data loads properly
- **Test Steps:**
  1. Ensure no existing `profileChatterConfig.json` file
  2. Load Configurator UI
  3. Check that default values populate all fields
  4. Verify default theme (iOS) is active
- **Expected Result:** Default config loads, iOS theme active, SVG preview shows default state
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-INIT-003

- **Feature/Component:** Existing Configuration Loading
- **Test Objective:** Verify existing profileChatterConfig.json loads correctly
- **Test Steps:**
  1. Ensure valid `profileChatterConfig.json` exists
  2. Load Configurator UI
  3. Verify all saved settings are restored
  4. Check SVG preview reflects saved configuration
- **Expected Result:** Saved configuration loads correctly, UI reflects saved state
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### B. Profile Editor (ProfileEditor.svelte)

#### TC-PROF-001

- **Feature/Component:** Profile Fields Editing
- **Test Objective:** Verify all profile fields can be edited and persist
- **Test Steps:**
  1. Navigate to Profile Editor section
  2. Edit Name field with test value "Test User"
  3. Edit Profession field with "Software Developer"
  4. Edit Location field with "San Francisco, CA"
  5. Edit Company field with "Test Company"
  6. Edit Current Project field with "ProfileChatter V2"
  7. Save and verify changes persist in config file
- **Expected Result:** All fields accept input, changes reflect in preview where applicable, data persists
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PROF-002

- **Feature/Component:** Timezone Selection
- **Test Objective:** Verify timezone dropdown functionality
- **Test Steps:**
  1. Click timezone dropdown
  2. Select different timezone (e.g., "America/New_York")
  3. Verify selection is saved
  4. Check that time-based placeholders reflect new timezone
- **Expected Result:** Timezone changes, time placeholders update accordingly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PROF-003

- **Feature/Component:** Username Validation
- **Test Objective:** Verify username field validation for external services
- **Test Steps:**
  1. Enter valid GitHub username
  2. Enter invalid GitHub username (with special characters)
  3. Test WakaTime, Twitter, and CodeStats username fields
  4. Observe validation feedback
- **Expected Result:** Valid usernames accepted, invalid ones show appropriate validation messages
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PROF-004

- **Feature/Component:** Work Start Date
- **Test Objective:** Verify work start date editing and validation
- **Test Steps:**
  1. Change Work Start Date year to previous year
  2. Change month to different valid month
  3. Change day to valid day for selected month
  4. Try invalid date combinations
  5. Verify changes persist and affect work experience calculations
- **Expected Result:** Valid dates accepted, invalid dates rejected, work experience updates
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### C. Theme Management (ThemeSelector.svelte, ThemeEditor.svelte)

#### TC-THEME-001

- **Feature/Component:** Base Theme Switching
- **Test Objective:** Verify switching between built-in themes
- **Test Steps:**
  1. Start with iOS theme active
  2. Switch to Android theme
  3. Switch to Discord theme
  4. Return to iOS theme
  5. Verify SVG preview updates with each change
- **Expected Result:** Theme switches correctly, preview updates immediately, selection persists
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-THEME-002

- **Feature/Component:** Theme Editor - General Settings
- **Test Objective:** Verify general theme property editing
- **Test Steps:**
  1. Open Theme Editor
  2. Navigate to General tab
  3. Modify background color using color picker
  4. Change border radius values
  5. Adjust padding settings
  6. Verify changes reflect in preview
- **Expected Result:** All general settings update correctly, preview shows changes
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-THEME-003

- **Feature/Component:** Theme Editor - Bubble Settings
- **Test Objective:** Verify chat bubble theme customization
- **Test Steps:**
  1. Navigate to Bubbles tab in Theme Editor
  2. Modify bubble colors for both sender types
  3. Change bubble border radius
  4. Adjust text colors
  5. Modify bubble padding/margins
  6. Check advanced settings toggle
- **Expected Result:** Bubble appearance updates in preview, all settings function correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-THEME-004

- **Feature/Component:** Theme Editor - Animation Settings
- **Test Objective:** Verify animation timing and behavior controls
- **Test Steps:**
  1. Navigate to animation settings section
  2. Modify animation duration values
  3. Change animation delay settings
  4. Adjust easing functions if available
  5. Test animation toggle on/off
- **Expected Result:** Animation settings update correctly, preview reflects timing changes
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-THEME-005

- **Feature/Component:** Theme Persistence
- **Test Objective:** Verify theme changes persist in configuration
- **Test Steps:**
  1. Make multiple theme modifications
  2. Check `profileChatterConfig.json` for themeOverrides section
  3. Restart application
  4. Verify theme modifications are restored
- **Expected Result:** Theme changes save to config file and restore correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### D. Avatar Settings (AvatarSettingsEditor.svelte)

#### TC-AVATAR-001

- **Feature/Component:** Avatar Enable/Disable
- **Test Objective:** Verify avatar functionality toggle
- **Test Steps:**
  1. Toggle avatars off
  2. Verify avatars disappear from preview
  3. Toggle avatars back on
  4. Verify avatars reappear
- **Expected Result:** Avatar visibility toggles correctly in preview
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-AVATAR-002

- **Feature/Component:** Avatar Shape Selection
- **Test Objective:** Verify avatar shape options
- **Test Steps:**
  1. Set avatar shape to circle
  2. Verify preview shows circular avatars
  3. Change to square shape
  4. Verify preview updates to square avatars
- **Expected Result:** Avatar shapes change correctly in preview
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-AVATAR-003

- **Feature/Component:** Base64 Avatar Upload
- **Test Objective:** Verify Base64 data URI validation and usage
- **Test Steps:**
  1. Input valid Base64 data URI for "Me" avatar
  2. Verify validation feedback is positive
  3. Input invalid Base64 string
  4. Verify validation error appears
  5. Test "Visitor" avatar field similarly
- **Expected Result:** Valid Base64 accepted with positive feedback, invalid data rejected
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-AVATAR-004

- **Feature/Component:** External URL Avatars
- **Test Objective:** Verify external URL handling and warnings
- **Test Steps:**
  1. Input external HTTP URL for avatar
  2. Check for console warnings about external URLs
  3. Input HTTPS URL
  4. Verify behavior difference between HTTP and HTTPS
- **Expected Result:** External URLs accepted but console warnings shown for HTTP
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-AVATAR-005

- **Feature/Component:** Avatar Fallback Text
- **Test Objective:** Verify fallback text functionality
- **Test Steps:**
  1. Clear avatar URLs
  2. Set fallback text for both "Me" and "Visitor"
  3. Verify fallback text appears in preview
  4. Test with different text lengths
- **Expected Result:** Fallback text displays correctly when no avatar URL provided
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### E. Chat Message Management

#### TC-CHAT-001

- **Feature/Component:** Add New Messages
- **Test Objective:** Verify new message creation
- **Test Steps:**
  1. Click "Add Message" button
  2. Verify new message appears in chat list
  3. Add multiple messages
  4. Verify order and numbering
- **Expected Result:** New messages created successfully, appear in correct order
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-002

- **Feature/Component:** Message Text Editing
- **Test Objective:** Verify message text editing and placeholder helper
- **Test Steps:**
  1. Edit message text directly
  2. Use Dynamic Placeholder Helper to insert placeholders
  3. Test various placeholder types (profile, time, work experience)
  4. Verify placeholders resolve correctly in preview
- **Expected Result:** Text editing works, placeholders insert and resolve correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-003

- **Feature/Component:** Message Sender Toggle
- **Test Objective:** Verify sender switching between Me/Visitor
- **Test Steps:**
  1. Create message with "Me" as sender
  2. Switch sender to "Visitor"
  3. Verify visual changes in chat list and preview
  4. Test multiple messages with different senders
- **Expected Result:** Sender changes correctly, visual appearance updates appropriately
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-004

- **Feature/Component:** Message Deletion
- **Test Objective:** Verify message deletion functionality
- **Test Steps:**
  1. Create several test messages
  2. Delete middle message
  3. Delete first message
  4. Delete last message
  5. Verify remaining messages renumber correctly
- **Expected Result:** Messages delete correctly, remaining messages maintain proper order
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-005

- **Feature/Component:** Content Type Switching
- **Test Objective:** Verify switching between Text and Chart content
- **Test Steps:**
  1. Create text message
  2. Switch content type to Chart
  3. Verify chart editor appears
  4. Switch back to Text
  5. Verify text editor returns
- **Expected Result:** Content type switching works correctly, appropriate editors shown
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-006

- **Feature/Component:** Horizontal Bar Chart Editing
- **Test Objective:** Verify bar chart creation and editing
- **Test Steps:**
  1. Create message with Horizontal Bar chart
  2. Edit chart title
  3. Set max value
  4. Add chart items with labels, values, and colors
  5. Test drag-and-drop reordering of items
  6. Delete chart items
- **Expected Result:** Bar chart editor functions correctly, changes reflect in preview
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-007

- **Feature/Component:** Donut Chart Editing
- **Test Objective:** Verify donut chart creation and editing
- **Test Steps:**
  1. Create message with Donut chart
  2. Edit chart title
  3. Set center text
  4. Add chart segments with labels, values, and colors
  5. Test drag-and-drop reordering of segments
  6. Delete chart segments
- **Expected Result:** Donut chart editor functions correctly, changes reflect in preview
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-008

- **Feature/Component:** WakaTime Data Integration
- **Test Objective:** Verify WakaTime data toggle functionality
- **Test Steps:**
  1. Create chart with "Use WakaTime Data" enabled
  2. Verify chart pulls live WakaTime data (if API key configured)
  3. Toggle to "Switch to Static Data"
  4. Verify chart switches to manual data entry
  5. Toggle back to WakaTime data
- **Expected Result:** WakaTime data integration works, toggle functions correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-009

- **Feature/Component:** Emoji Reactions
- **Test Objective:** Verify emoji reaction functionality
- **Test Steps:**
  1. Add emoji reactions to messages
  2. Test emoji picker interface
  3. Add multiple reactions to single message
  4. Remove reactions
  5. Verify reactions appear in preview
- **Expected Result:** Emoji reactions add/remove correctly, display in preview
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CHAT-010

- **Feature/Component:** Message Drag-and-Drop Reordering
- **Test Objective:** Verify message reordering functionality
- **Test Steps:**
  1. Create multiple messages
  2. Drag message from bottom to top
  3. Drag message from top to middle
  4. Verify order changes reflect in preview
  5. Verify message numbers update correctly
- **Expected Result:** Messages reorder correctly, numbering updates, preview reflects changes
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### F. SVG Preview (SvgPreviewRenderer.svelte)

#### TC-PREVIEW-001

- **Feature/Component:** Preview Refresh
- **Test Objective:** Verify manual preview refresh functionality
- **Test Steps:**
  1. Make configuration changes
  2. Click "Refresh" button
  3. Verify preview updates with latest changes
  4. Test refresh with no changes
- **Expected Result:** Refresh button updates preview correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PREVIEW-002

- **Feature/Component:** Server Connection Test
- **Test Objective:** Verify server connectivity testing
- **Test Steps:**
  1. Click "Test Server Connection" button
  2. Verify connection status message
  3. Stop preview server and test again
  4. Restart server and test connection
- **Expected Result:** Connection test accurately reports server status
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PREVIEW-003

- **Feature/Component:** Preview Width Selection
- **Test Objective:** Verify preview width options
- **Test Steps:**
  1. Test Mobile width setting
  2. Test GitHub S/M/L width settings
  3. Select Custom width and input custom value
  4. Verify preview adjusts width correctly
- **Expected Result:** Preview width changes correctly for all options
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PREVIEW-004

- **Feature/Component:** Light/Dark Mode Toggle
- **Test Objective:** Verify preview background mode switching
- **Test Steps:**
  1. Toggle between Light and Dark mode
  2. Verify background changes appropriately
  3. Test with different themes
  4. Verify toggle state persists
- **Expected Result:** Background mode switches correctly, state persists
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PREVIEW-005

- **Feature/Component:** Scroll Speed Adjustment
- **Test Objective:** Verify client-side animation speed control
- **Test Steps:**
  1. Adjust scroll speed multiplier
  2. Verify animation speed changes in preview
  3. Test with different speed values
  4. Reset to default speed
- **Expected Result:** Animation speed adjusts correctly with multiplier changes
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PREVIEW-006

- **Feature/Component:** Copy SVG Markup
- **Test Objective:** Verify SVG markup copy functionality
- **Test Steps:**
  1. Click "Copy SVG Markup" button
  2. Verify success message appears
  3. Paste content to verify SVG markup copied
  4. Test with different configurations
- **Expected Result:** SVG markup copies correctly to clipboard
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PREVIEW-007

- **Feature/Component:** Error Message Display
- **Test Objective:** Verify error handling in preview
- **Test Steps:**
  1. Stop preview server
  2. Verify error message appears in preview area
  3. Restart server
  4. Verify error message clears
- **Expected Result:** Error messages display and clear correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### G. Configuration Management

#### TC-CONFIG-001

- **Feature/Component:** Export Full Configuration
- **Test Objective:** Verify complete configuration export
- **Test Steps:**
  1. Click "Export Configuration"
  2. Select JSON format
  3. Verify file downloads correctly
  4. Test JS format export
  5. Verify exported content matches current config
- **Expected Result:** Configuration exports correctly in both formats
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-002

- **Feature/Component:** Export Specific Parts
- **Test Objective:** Verify partial configuration export
- **Test Steps:**
  1. Export Chat Messages only
  2. Export Theme only
  3. Export Profile only
  4. Export Avatars only
  5. Verify each export contains only relevant data
- **Expected Result:** Partial exports contain only selected configuration sections
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-003

- **Feature/Component:** Import Full Configuration
- **Test Objective:** Verify complete configuration import
- **Test Steps:**
  1. Export current configuration as backup
  2. Modify current configuration significantly
  3. Import previously exported configuration
  4. Verify all settings restore correctly
- **Expected Result:** Full configuration import restores all settings
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-004

- **Feature/Component:** Import Specific Parts
- **Test Objective:** Verify partial configuration import
- **Test Steps:**
  1. Import Chat Messages from valid JSON
  2. Import Theme from valid JSON
  3. Import Profile from valid JSON
  4. Import Avatars from valid JSON
  5. Verify only imported sections change
- **Expected Result:** Partial imports update only selected sections
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-005

- **Feature/Component:** Import Error Handling
- **Test Objective:** Verify error handling for invalid imports
- **Test Steps:**
  1. Attempt to import invalid file type
  2. Import corrupted JSON file
  3. Import JSON with wrong structure
  4. Verify appropriate error messages
- **Expected Result:** Invalid imports rejected with clear error messages
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-006

- **Feature/Component:** Prepare for GitHub Update
- **Test Objective:** Verify GitHub preparation functionality
- **Test Steps:**
  1. Click "Prepare for GitHub Update" button
  2. Verify configuration copies to clipboard
  3. Verify GitHub instructions panel appears
  4. Test panel dismissal
- **Expected Result:** Configuration copied, instructions shown correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-007

- **Feature/Component:** Spotify OAuth Connection
- **Test Objective:** Verify Spotify OAuth flow
- **Test Steps:**
  1. Check initial Spotify connection status
  2. Click "Connect" or "Reconnect" for Spotify
  3. Complete OAuth flow in browser
  4. Verify connection status updates
  5. Test disconnect functionality if available
- **Expected Result:** Spotify OAuth flow completes successfully, status updates correctly
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-008

- **Feature/Component:** GitHub OAuth Connection
- **Test Objective:** Verify GitHub OAuth flow
- **Test Steps:**
  1. Check initial GitHub connection status
  2. Click "Connect" or "Reconnect" for GitHub
  3. Complete OAuth flow in browser
  4. Verify connection status updates
  5. Test access to repository list
- **Expected Result:** GitHub OAuth flow completes successfully, repository access granted
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-CONFIG-009

- **Feature/Component:** Direct GitHub Commit
- **Test Objective:** Verify direct commit to GitHub functionality
- **Test Steps:**
  1. Ensure GitHub OAuth is connected
  2. Select target repository from list
  3. Edit commit message
  4. Save configuration to GitHub
  5. Verify success message and commit URL
  6. Check GitHub repository for updated file
- **Expected Result:** Configuration commits successfully to GitHub repository
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### H. Configuration Persistence

#### TC-PERSIST-001

- **Feature/Component:** Real-time Configuration Saving
- **Test Objective:** Verify automatic configuration persistence
- **Test Steps:**
  1. Make various configuration changes
  2. Check `profileChatterConfig.json` file updates
  3. Verify changes are debounced (not saved on every keystroke)
  4. Verify all sections save correctly
- **Expected Result:** Configuration saves automatically and accurately to file
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-PERSIST-002

- **Feature/Component:** Configuration Reload
- **Test Objective:** Verify configuration persistence across sessions
- **Test Steps:**
  1. Make comprehensive configuration changes
  2. Stop application (`npm run config:dev`)
  3. Restart application
  4. Verify all changes restored correctly
  5. Check preview reflects saved state
- **Expected Result:** All configuration changes persist across application restarts
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

### I. Error Handling & Edge Cases

#### TC-ERROR-001

- **Feature/Component:** Invalid Data Input
- **Test Objective:** Verify application handles invalid inputs gracefully
- **Test Steps:**
  1. Input extremely long text in message fields
  2. Input special characters in username fields
  3. Input negative numbers in numeric fields
  4. Input invalid dates
  5. Verify error messages and input validation
- **Expected Result:** Invalid inputs handled gracefully with appropriate feedback
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-ERROR-002

- **Feature/Component:** Empty Configuration Handling
- **Test Objective:** Verify behavior with minimal/empty configuration
- **Test Steps:**
  1. Delete all chat messages
  2. Clear all profile data
  3. Verify application continues to function
  4. Check preview handles empty state
- **Expected Result:** Application handles empty states gracefully
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-ERROR-003

- **Feature/Component:** Console Error Monitoring
- **Test Objective:** Verify no unexpected console errors during normal operation
- **Test Steps:**
  1. Open browser developer console
  2. Perform comprehensive UI testing
  3. Monitor for JavaScript errors, warnings, or exceptions
  4. Document any unexpected console output
- **Expected Result:** No unexpected errors or warnings in console during normal operation
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

#### TC-ERROR-004

- **Feature/Component:** Preview Server Disconnection
- **Test Objective:** Verify behavior when preview server is unavailable
- **Test Steps:**
  1. Stop preview server while UI is running
  2. Attempt to refresh preview
  3. Try to test server connection
  4. Restart server and verify recovery
- **Expected Result:** UI handles server disconnection gracefully with appropriate error messages
- **Actual Result:** [ ]
- **Notes/Bug ID:** [ ]

---

### J. Relaunch — Reliability, Honesty & Contrast (v1.1)

These cover the relaunch reliability spine, honest data, off-by-default weather, skip-vs-fallback semantics, light/dark contrast (P1/P2), the fork commit-back fallback, and the README visual proof.

#### TC-REL-001 — Zero-key / fresh-clone build

- Steps: Fresh clone with no `.env` and no secrets, run `npm install` then `npm run build`.
- Expected: `dist/profile-chat.svg` renders with sensible defaults; no errors; no placeholder/garbage values; unconfigured integrations are skipped cleanly.

#### TC-REL-002 — Status manifest classifications

- Steps: Run a build; open `dist/status-manifest.json` and the GitHub Actions step summary.
- Expected: Each source is classified live / skip / fallback / error; counts are accurate; 401/403/429 on a *configured* source surface as high-signal.

#### TC-REL-003 — Alert open/close behavior

- Steps: Cause a configured source to fail across a run, then restore it.
- Expected: Exactly one GitHub issue auto-opens while failing and updates rather than spamming; it closes on recovery; no alert state is committed to the repo.

#### TC-REL-004 — Skip vs fallback

- Steps: Leave Spotify and GitHub-OAuth unconfigured; run a build.
- Expected: They are reported as intentional **skip**, never fallback/error; no false alarm; defaults render.

#### TC-REL-005 — Honest GitHub commit count

- Steps: With a valid `PAT_GITHUB_OAUTH`, build and inspect the commits-last-year value.
- Expected: Value is the real GitHub GraphQL contribution count (no fabricated estimate, no leading ~).

#### TC-REL-006 — Weather off by default

- Steps: With no AccuWeather key, build; then set `weather.enabled: true` + a key and rebuild.
- Expected: Off by default → weather is skipped with defaults, no error. Enabled+key → live weather renders.

#### TC-REL-007 — Light/dark contrast (P1 + P2)

- Steps: View the SVG in light and dark for iOS, Android, and Discord (e.g. via the Configurator Mode toggle / OS color scheme).
- Expected: Status text (Delivered/Read) is readable in both modes; visitor bubbles/text and visitor-side chart surfaces adapt (no white-on-white status, no glaring light slab in dark, no dark blob in light). Me-side unchanged.

#### TC-REL-008 — Fork commit-back token fallback

- Steps: On a fork without the owner PAT, enable Actions and let the build run.
- Expected: The build auto-commits the SVG via `github.token` (no owner PAT required); the live badge updates.

#### TC-REL-009 — Spotify-skip copy reads naturally

- Steps: With Spotify unconfigured, inspect the rendered Spotify message.
- Expected: Copy reads naturally (e.g. "I'm jamming to my coding playlist right now…"); no awkward "jamming to Not currently listening to music. right now".

#### TC-REL-010 — README image/link check on GitHub

- Steps: Open the rendered README on GitHub.
- Expected: Hero badge, the six-image theme gallery (light + dark rows), Configurator screenshots, and the status-manifest image all load; all links resolve.

## Test Execution Log Template

| Test Case ID | Status | Actual Result | Notes/Bug ID | Tester | Date |
|--------------|--------|---------------|--------------|--------|------|
| TC-INIT-001 | | | | | |
| TC-INIT-002 | | | | | |
| TC-INIT-003 | | | | | |
| ... | | | | | |

### Test Execution Summary

- **Total Test Cases:** 54
- **Passed:** [ ]
- **Failed:** [ ]
- **Blocked:** [ ]
- **Not Executed:** [ ]

### Critical Issues Found

1. [Issue ID] - [Description] - [Severity] - [Status]
2. [Issue ID] - [Description] - [Severity] - [Status]

### Testing Notes

- **Testing Environment:** [OS, Browser, Node.js version]
- **Tester:** [Name]
- **Test Execution Date:** [Date]
- **Application Version:** [Commit hash or version]

### Recommendations

- [ ] All critical functionality verified
- [ ] No blocking issues for release
- [ ] Performance acceptable
- [ ] User experience meets expectations
- [ ] Ready for V2 release: Yes/No
