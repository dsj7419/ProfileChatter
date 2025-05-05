# ProfileChatter

A dynamic SVG chat visualization generator for your GitHub profile README or other web pages. Create an interactive, auto-updating chat bubble visualization that shows real-time information like current date, weather, and GitHub stats.

![ProfileChatter SVG](https://raw.githubusercontent.com/YOUR_USERNAME/ProfileChatter/main/dist/profile-chat.svg?ts=1746420773)

## How it Works

ProfileChatter uses a combination of:

1. **GitHub Actions**: Scheduled workflows that run every 6 hours to keep your SVG visualization fresh
2. **Node.js**: Backend scripts that fetch live data and generate the SVG
3. **Dynamic Templating**: Text placeholders that get replaced with real-time data

The system fetches current information (date, weather, GitHub stats) and injects it into a chat-style interface designed to look like modern messaging apps, complete with animated typing indicators and chat bubbles.

## Configuration

### Basic Setup

1. Fork this repository
2. Set up required repository secrets:
   - `WEATHER_API_KEY`: Your AccuWeather API key for weather data
   - `LOCATION_KEY`: Location ID for your city from AccuWeather
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

### Customizing GitHub Data

Open `src/dataFetcher.js` and change the `githubUsername` variable (around line 102) from the default placeholder to your actual GitHub username.

### Customizing Start Date

To accurately reflect your work tenure, update the `workStartDate` variable in `src/dataFetcher.js` with your actual start date.

## Development

```bash
# Install dependencies
npm install

# Generate SVG manually
node src/main.js

# Format code
npm run format

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve ProfileChatter.

This project is based on the [ProfileChatter](https://github.com/dsj7419/ProfileChatter) repository.

## License

This project is licensed under the Unlicense - see the LICENSE file for details, meaning it's completely free to use, modify, and distribute without any restrictions.
