# ProfileChatter

A dynamic SVG chat visualization generator for your GitHub profile README or other web pages. Create an interactive, auto-updating chat bubble visualization that shows real-time information like current date, weather, and GitHub stats.

![ProfileChatter SVG](https://raw.githubusercontent.com/dsj7419/ProfileChatter/main/dist/profile-chat.svg?ts=1747505136)

## How it Works

ProfileChatter uses a combination of:

1. **GitHub Actions**: Scheduled workflows that run every 6 hours to keep your SVG visualization fresh
2. **Node.js**: Backend scripts that fetch live data and generate the SVG
3. **Dynamic Templating**: Text placeholders that get replaced with real-time data

The system fetches current information (date, weather, GitHub stats) and injects it into a chat-style interface designed to look like modern messaging apps, complete with animated typing indicators and chat bubbles.

## Configuration

### Basic Setup

1. Fork this repository
2. Set up API Access:

   - For Automated Updates (GitHub Actions): Configure the following as repository secrets in your GitHub repository settings:
     - `WEATHER_API_KEY`: Your AccuWeather API key.
     - `LOCATION_KEY`: Your AccuWeather location key.
     - (Optional) `GITHUB_TOKEN`: Your GitHub Personal Access Token if needed.

   - For Local Development:
     - Copy the `.env.template` file (located in the project root) to a new file named `.env`.
     - Fill in your API keys in the `.env` file. This file is already in `.gitignore` and should not be committed.

3. Edit your GitHub profile README to embed the SVG

### Choosing a Theme

ProfileChatter now supports multiple visual themes to match different messaging app styles:

1. To change the theme, edit the `activeTheme` property in `src/config/config.js`:

```javascript
// In src/config/config.js
export const config = {
    // Theme selection - default to iOS theme
    activeTheme: "ios",
    
    // Rest of the configuration...
}
```

Available themes:

- **ios** (Default): Apple's iOS Messages app style with blue user bubbles, gray visitor bubbles, and rounded corners
- **android**: Android Messages style with light blue user bubbles, light gray visitor bubbles, and less rounded corners

The visual differences between themes include:

| Feature | iOS Theme | Android Theme |
|---------|-----------|---------------|
| User Bubble Color | #0B93F6 (Blue) | #D1E6FF (Light Blue) |
| Visitor Bubble Color | #E5E5EA (Gray) | #F0F0F0 (Light Gray) |
| User Text Color | #FFFFFF (White) | #000000 (Black) |
| Visitor Text Color | #000000 (Black) | #000000 (Black) |
| Bubble Radius | 18px (More Rounded) | 8px (Less Rounded) |
| Font Family | 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif | 'Roboto', sans-serif |
| Dark Mode Background | #000000 | #121212 |

If the specified `activeTheme` is invalid or not found, the system will automatically fall back to the "ios" theme.

### Customizing Messages

Edit the messages in `data/chatData.json` to personalize the conversation. The following placeholders are available:

```markdown
{name}              - Your name
{profession}        - Your job title
{location}          - Your city/location
{company}           - Your company name
{workTenure}        - Calculated time at current job
{currentDayOfWeek}  - Current day of the week
{currentDate}       - Full current date
{temperature}       - Current temperature
{weatherDescription}- Current weather condition
{emoji}             - Weather-appropriate emoji
{githubPublicRepos} - Number of your public GitHub repos
{githubFollowers}   - Number of your GitHub followers
{currentProject}    - Description of your current project
```

### User Profile Customization

To personalize your profile information, edit the `profile` object within the `src/config/config.js` file:

```javascript
// In src/config/config.js
profile: {
  // Personal information
  NAME: "Your Name Here",
  PROFESSION: "Your Profession",
  LOCATION: "Your City",
  COMPANY: "Your Company",
  CURRENT_PROJECT: "What you're working on",
  
  // Work information (used for calculating tenure)
  WORK_START_DATE: new Date(YYYY, MM-1, DD), // Example: new Date(2020, 0, 1) for Jan 1, 2020
  
  // GitHub username for stats
  GITHUB_USERNAME: "YourGitHubUsername"
},
```

Note: For `WORK_START_DATE`, the month is zero-indexed (0 = January, 11 = December).

### Advanced Configuration

For more advanced customization, you can modify other settings in `src/config/config.js`:

#### Cache Settings

```javascript
cache: {
  WEATHER_CACHE_TTL_MS: 1800000, // Weather data cache lifetime (30 minutes)
  GITHUB_CACHE_TTL_MS: 3600000   // GitHub data cache lifetime (1 hour)
},
```

#### API Fallback Values

```javascript
apiDefaults: {
  // Used when APIs fail
  TEMPERATURE: "72°F (22°C)",
  WEATHER_DESCRIPTION: "partly cloudy",
  WEATHER_EMOJI: "⛅",
  GITHUB_PUBLIC_REPOS: "12",
  GITHUB_FOLLOWERS: "48"
},
```

#### Layout & Animation Settings

```javascript
layout: {
  FONT_SIZE_PX: 14,           // Base font size
  LINE_HEIGHT_PX: 20,         // Text line height
  CHAT_WIDTH_PX: 320,         // Total width of the chat container
  CHAT_HEIGHT_PX: 450,        // Total height of the chat container
  BUBBLE_PAD_X_PX: 12,        // Horizontal padding inside bubbles
  BUBBLE_PAD_Y_PX: 8,         // Vertical padding inside bubbles
  MIN_BUBBLE_W_PX: 40,        // Minimum bubble width
  MAX_BUBBLE_W_PX: 260,       // Maximum bubble width
  TYPING_CHAR_MS: 40,         // Typing speed per character
  TYPING_MIN_MS: 1600,        // Minimum typing time
  TYPING_MAX_MS: 3000,        // Maximum typing time
  // More options available in src/config/config.js
}
```

## Development

```bash
# Install dependencies
npm install

# Generate SVG manually
npm run build
# or
node src/main.js

# Preview in browser
npm run preview

# Format code
npm run format

# Lint code
npm run lint
```

Local development uses a `.env` file (powered by the dotenv package) for environment variables. See `.env.template` for setup instructions.

## Embedding in Your GitHub Profile

1. After configuring and generating your SVG, make sure it's committed to your repository
2. In your profile repository (usually `yourusername/yourusername`), edit the README.md
3. Add an image reference to your ProfileChatter SVG:

```markdown
![My Profile Chat](https://raw.githubusercontent.com/yourusername/ProfileChatter/main/dist/profile-chat.svg?ts=1747505136)
```

The SVG will automatically update every 6 hours via GitHub Actions workflow.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve ProfileChatter.

Some areas for potential contribution:

- Additional themes (e.g., WhatsApp, Discord, Telegram)
- New data integrations
- Performance optimizations
- Accessibility improvements

This project is based on the [ProfileChatter](https://github.com/dsj7419/ProfileChatter) repository.

## License

This project is licensed under the Unlicense - see the LICENSE file for details, meaning it's completely free to use, modify, and distribute without any restrictions.

## Acknowledgments

- AccuWeather API for weather data
- GitHub API for repository and follower statistics
- Built with Node.js and SVG animation techniques

---

For issues, feature requests, or questions, please open an issue on the GitHub repository.
