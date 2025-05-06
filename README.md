# ProfileChatter

A dynamic SVG chat visualization generator for your GitHub profile README or other web pages. Create an interactive, auto-updating chat bubble visualization that shows real-time information like current date, weather, and GitHub stats.

![ProfileChatter SVG](https://raw.githubusercontent.com/dsj7419/ProfileChatter/main/dist/profile-chat.svg?ts=1746423562)

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

### Customizing Messages

Edit the messages in `data/chatData.json` to personalize the conversation. The following placeholders are available:

```markdown
{name} - Your name
{profession} - Your job title
{location} - Your city/location
{company} - Your company name
{workTenure} - Calculated time at current job
{currentDayOfWeek} - Current day of the week
{currentDate} - Full current date
{temperature} - Current temperature
{weatherDescription} - Current weather condition
{emoji} - Weather-appropriate emoji
{githubPublicRepos} - Number of your public GitHub repos
{githubFollowers} - Number of your GitHub followers
{currentProject} - Description of your current project
```

### User Profile Customization

To personalize your profile information such as your name, profession, GitHub username, company, location, current project, and work start date, edit the `profile` object within the `src/config/config.js` file. For example:

```javascript
// In src/config/config.js
// ...
profile: {
  NAME: "Your Name Here",
  PROFESSION: "Your Profession",
  LOCATION: "Your City",
  COMPANY: "Your Company",
  CURRENT_PROJECT: "What you're working on",
  WORK_START_DATE: new Date(YYYY, MM-1, DD), // Example: new Date(2020, 0, 1) for Jan 1, 2020
  GITHUB_USERNAME: "YourGitHubUsername"
},
// ...
```

## Development

```bash
# Install dependencies (this will also install dotenv used for managing local .env files)
npm install

# Generate SVG manually
node src/main.js

# Format code
npm run format

# Lint code
npm run lint
```

Local development uses a `.env` file (powered by the dotenv package) for environment variables. See `.env.template` for setup instructions.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve ProfileChatter.

This project is based on the [ProfileChatter](https://github.com/dsj7419/ProfileChatter) repository.

## License

This project is licensed under the Unlicense - see the LICENSE file for details, meaning it's completely free to use, modify, and distribute without any restrictions.
