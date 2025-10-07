# ProfileChatter

> **Animated chat bubbles that talk for you** – a fully‑automated SVG generator that drops a live, messaging‑style panel into your GitHub&nbsp;profile.  
> Powered by Node 20, GitHub Actions, and a **zero‑config Configurator UI**.

![ProfileChatter Demo](https://raw.githubusercontent.com/dsj7419/ProfileChatter/main/dist/profile-chat.svg?ts=1759796421{{CI_TIMESTAMP}})

---

## 🌟 Why ProfileChatter?

*Static README badges are yesterday's news.*  
ProfileChatter turns your profile into a **living conversation** that updates itself – showcasing your latest repos, current weather, coding activity, social reach, and more. Set it up once, and your profile keeps talking.

---

## ✨ Highlights

| | |
| --- | --- |
| **Live data on display** | GitHub repos & followers, local weather (optional), WakaTime stats, Twitter/X followers (manual by default), Code::Stats XP – plug‑and‑play, no API keys required for basic functionality |
| **No‑code Configurator UI** | `npm run config:dev` launches a Svelte app to visually customise messages, themes, avatars, charts & more |
| **Dynamic charts** | Donut & horizontal‑bar charts with per‑segment animation – auto‑generated from WakaTime or any JSON array |
| **Themes that fit in** | iOS, Android & **Discord** styles out of the box – add your own with a single theme object in `config.js` *or* through the UI |
| **Smooth, adaptive animations** | Dynamic scroll easing, typing indicators, bubble pop‑ins, chart draw effects |
| **Quick, safe builds** | GitHub Actions rebuild every 6 h (or on push) with runtime config validation and comprehensive test suite |

---

## 🛠 How it Works

1. **GitHub Actions** (`.github/workflows/main.yml`) run on a 6‑hour cron or any push.  
2. **Node scripts** fetch data and render a fresh SVG to `dist/`.  
3. **TimelineBuilder → SvgRenderer** convert chatData + config into animated markup.  
4. **Configurator UI** writes `profileChatterConfig.json`; when present it overrides `src/config/config.js` for the sections it contains.

---

## 🚀 Quick Start

```bash
# 1 – Fork the repo, then clone your fork
git clone https://github.com/<you>/ProfileChatter.git
cd ProfileChatter

# 2 – Install dependencies & view the default output
npm install
npm run build
#  └─ open dist/profile-chat.svg to preview the out‑of‑the‑box experience

# 3 – Launch the Configurator UI (highly recommended)
npm run config:dev
#  └─ edit profile, theme, avatars, chat messages, charts…
#  └─ click **Export Configuration** → profileChatterConfig.json

# 4 – Copy the exported profileChatterConfig.json to the project root directory, commit & push
git add profileChatterConfig.json
git commit -m "feat: personalise ProfileChatter"
git push
```

> **Tip:** For local work, create a `.env` from `.env.template` and drop your API keys there.

---

## 🔑 Repository Secrets / Env Variables

**Important:** No API keys are strictly required for ProfileChatter to generate a basic SVG. All integrations are optional and enhance the dynamic content. The system gracefully falls back to defaults or user-configured static values.

| Service / Variable | Status | Purpose | Setup Link/Notes |
|----------------------------|--------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------|
| **Weather (AccuWeather)** | | | |
| `WEATHER_API_KEY` | ☐ Optional | Fetches live weather data. | See "AccuWeather API Setup" section below. |
| `LOCATION_KEY` | ☐ Optional | Specifies city for weather. | See "AccuWeather API Setup" section below. |
| **GitHub (Public Data)** | | | |
| `PAT_GITHUB_BASIC` | ☐ Optional | Avoids public API rate limits for basic GitHub stats. | GitHub PATs (public_repo scope) |
| **GitHub (OAuth Data)** | | | |
| `PAT_GITHUB_OAUTH` | ☐ Optional | Enables enhanced stats (stars, commits, primary lang via OAuth). | See "GitHub Enhanced Statistics Setup" section below. |
| `GITHUB_CLIENT_ID` | ☐ For Local OAuth | Used by local Configurator UI for GitHub OAuth. | See "GitHub Enhanced Statistics Setup" section below. |
| `GITHUB_CLIENT_SECRET` | ☐ For Local OAuth | Used by local Configurator UI for GitHub OAuth. | See "GitHub Enhanced Statistics Setup" section below. |
| `GITHUB_REDIRECT_URI` | ☐ For Local OAuth | Default: <http://127.0.0.1:3001/callback> | See "GitHub Enhanced Statistics Setup" section below. |
| **WakaTime** | | | |
| `WAKATIME_API_KEY` | ☐ Optional | Shows coding activity stats & dynamic charts. | [WakaTime API Key](https://wakatime.com/api-key) |
| **Spotify** | | | |
| `SPOTIFY_CLIENT_ID` | ☐ For Local/CI | Enables "Now Playing" feature. | See "Spotify Integration Setup" section below. |
| `SPOTIFY_CLIENT_SECRET` | ☐ For Local/CI | Enables "Now Playing" feature. | See "Spotify Integration Setup" section below. |
| `SPOTIFY_REFRESH_TOKEN` | ☐ For CI OAuth | Allows automated Spotify data refresh in CI. | See "Spotify Integration Setup" section below. |
| `SPOTIFY_REDIRECT_URI` | ☐ For Local OAuth | Default: <http://127.0.0.1:3001/callback> | See "Spotify Integration Setup" section below. |
| **Twitter/X** | | | |
| `TWITTER_BEARER_TOKEN` | ☐ Adv. (High Cost) | For live follower count (default is manual entry). | See "Twitter/X Integration" section below. Use with extreme caution due to cost. |
| **Code::Stats** | | | |
| (Username in UI/config) | ☐ Optional | Shows Code::Stats XP. No API key needed, just username. | See "Code::Stats Integration" section below. |

**Note:** For local development, place these in a `.env` file. For GitHub Actions, configure them as repository secrets.

---

## 🛠️ API & Service Integration Setup

### 🌤️ AccuWeather API Setup (Optional)

Weather integration is optional and can be disabled in the UI/config. To enable it:

1. **Get your AccuWeather API Key**
   - Sign up at [AccuWeather Developer Portal](https://developer.accuweather.com/)
   - Create an App to get your API Key
   - Copy the API key for use as `WEATHER_API_KEY`

2. **Find your AccuWeather Location Key**
   - Use the AccuWeather Location API to find your city's key
   - Example API call: `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=YOUR_API_KEY&q=YOUR_CITY_NAME`
   - You can also use tools like curl or Postman to make this request
   - Find your city in the JSON response and copy the **Key** value (e.g., "347628" for San Diego)
   - This Key value is your `LOCATION_KEY`

3. **Add to your environment**
   - For local development: Add both keys to your `.env` file
   - For GitHub Actions: Add both as repository secrets

### 🐦 Twitter/X Integration (Manual by Default)

**Important:** Live API fetching is disabled by default due to significant Twitter API costs. ProfileChatter now uses manually entered follower counts as the primary method.

#### Default Behavior (Recommended)

- The `{twitterFollowers}` placeholder uses your manually entered follower count
- Configure this via the Configurator UI's "Twitter Followers (Manual)" field in the Profile Editor
- No API costs, no setup required, works immediately

#### Advanced Live API Fetching (Optional - High Cost)

For users who understand and accept Twitter API costs:

1. **Enable API fetching**
   - Set `twitter.enabled_api_fetch: true` in your `profileChatterConfig.json` or `src/config/config.js`

2. **Add your Twitter Bearer Token**
   - Obtain from your [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) app settings
   - Add as `TWITTER_BEARER_TOKEN` environment variable/repository secret

3. **⚠️ Cost Warning**
   - Twitter API charges significant fees for follower endpoints
   - Review Twitter's current pricing before enabling
   - Monitor your usage to avoid unexpected charges
   - You are responsible for all API costs incurred

### 📊 Code::Stats Integration (Optional)

Code::Stats integration is simple and free:

- Your Code::Stats username is simply the username visible in your profile URL
- Example: If your profile is `https://codestats.net/users/your_username`, then `your_username` is what you need
- Enter this in the Configurator UI's "Code::Stats Username" field
- No API keys or additional setup required

### 🎵 Spotify Integration Setup

To enable Spotify integration in your automated builds:

1. **Create a Spotify Developer Application**
   - Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note your **Client ID** and **Client Secret**
   - Add `http://127.0.0.1:3001/callback` as a Redirect URI in your app settings

2. **Get Your Refresh Token (One-Time Setup)**
   - Create a `.env` file (if you don't have one) based on `.env.template`
   - Add your Spotify credentials:

     ```text
     SPOTIFY_CLIENT_ID=your_client_id
     SPOTIFY_CLIENT_SECRET=your_client_secret
     SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001/callback
     ```

   - Start the local authorization server:

     ```bash
     node configurator-ui/server/previewServer.js
     ```

   - Open `http://localhost:3001` in your browser
   - Click "Connect Spotify" (or navigate to `http://localhost:3001/auth/spotify`)
   - Authorize your application when prompted by Spotify
   - After successful authorization, a `.tokens/spotify.json` file will be created in your project

3. **Add Repository Secrets for GitHub Actions**
   - Open the `.tokens/spotify.json` file and copy the `refresh_token` value
   - In your GitHub repository, go to Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `SPOTIFY_CLIENT_ID`: Your Spotify app Client ID
     - `SPOTIFY_CLIENT_SECRET`: Your Spotify app Client Secret
     - `SPOTIFY_REFRESH_TOKEN`: The refresh token you copied from `.tokens/spotify.json`
     - `SPOTIFY_REDIRECT_URI`: `http://127.0.0.1:3001/callback`

4. **Security Note**
   - Ensure `.tokens/` is in your `.gitignore` file (it should be by default)
   - Never commit your tokens or credentials to the repository

Once these secrets are set, your GitHub Actions workflow will be able to fetch live Spotify data during the automated builds!

### 🐙 GitHub Enhanced Statistics Setup

To enable enhanced GitHub statistics in your automated builds:

1. **Create a GitHub OAuth Application**
   - Visit [GitHub Developer Settings](https://github.com/settings/developers)
   - Go to "OAuth Apps" and click "New OAuth App"
   - Fill in the details:
     - **Application name**: "ProfileChatter" (or your preferred name)
     - **Homepage URL**: Your repository URL or `http://127.0.0.1:3001`
     - **Authorization callback URL**: `http://127.0.0.1:3001/callback`
   - Click "Register application"
   - Generate a new client secret and save both the Client ID and Secret

2. **Create a Personal Access Token (PAT) for CI/CD**
   - Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "ProfileChatter CI/CD"
   - Set an appropriate expiration date
   - Select these scopes:
     - `read:user` (Required for reading user profile)
     - `public_repo` (If you only need access to public repositories)
   - Click "Generate token" and copy the token immediately

3. **Local Setup for Interactive Mode**
   - Add these to your `.env` file:

     ```text
     GITHUB_CLIENT_ID=your_oauth_app_client_id
     GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
     GITHUB_REDIRECT_URI=http://127.0.0.1:3001/callback
     ```

   - Start the server with: `node configurator-ui/server/previewServer.js`
   - Visit `http://localhost:3001` and click "Connect GitHub"
   - After authorizing, a `.tokens/github.json` file will be created

4. **Add Repository Secrets for GitHub Actions**
   - In your repository, go to Settings → Secrets and variables → Actions
   - Add the following secret:
     - `PAT_GITHUB_OAUTH`: The personal access token you created in step 2
   - Update your workflow file to include:

     ```yaml
     env:
       GITHUB_TOKEN: ${{ secrets.PAT_GITHUB_OAUTH }}
       GITHUB_DATA_MODE: 'ci'
     ```

5. **Security Notes**
   - Review and rotate your personal access token periodically
   - Always use the most restrictive scopes possible
   - Ensure `.tokens/` directory is in your `.gitignore`

Once configured, your ProfileChatter will display enhanced GitHub statistics such as total stars, commit counts, and primary programming language!

---

## 💻 Manual Configuration

**Recommended:** Use the Configurator UI (`npm run config:dev`) for the best experience. The UI provides visual editing with live preview and automatically saves your settings to `profileChatterConfig.json`.

### Configuration Hierarchy

ProfileChatter uses the following configuration priority (highest to lowest):

1. **`profileChatterConfig.json`** (if present and contains the relevant section) - Created by the Configurator UI, takes highest precedence for sections it contains
2. **`src/config/config.js`** - Provides base defaults for themes, layout, profile, etc.
3. **`data/chatData.json`** - Provides default chat messages only if `profileChatterConfig.json` doesn't exist or doesn't contain a `chatMessages` array

### Manual Editing (Advanced)

If you prefer manual configuration, advanced users can edit these files directly but should understand the hierarchy:

- **Themes** – copy an existing object, rename it (e.g. `myCustomTheme`), change colors & fonts, then set `activeTheme: "myCustomTheme"`.  
- **Layout & animation** – tweak bubble padding, scroll speed, chart timing, etc.  
- **Disable integrations** – e.g. set `wakatime.enabled = false` to turn WakaTime off.

---

## 💬 Message Placeholders

| Placeholder | Injected value |
| --- | --- |
| `{name}` / `{profession}` / `{location}` / `{company}` | Profile details |
| `{workTenure}` | Human‑readable tenure – e.g. "1 year 2 months" |
| `{currentDayOfWeek}` / `{currentDate}` | Localised date strings |
| `{dayName}` / `{time24}` / `{timezoneAbbr}` | Granular date/time placeholders |
| `{temperature}` / `{weatherDescription}` / `{emoji}` | Current weather (if enabled) |
| `{githubPublicRepos}` / `{githubFollowers}` | GitHub stats |
| `{wakatime_summary}` / `{wakatime_top_language}` / `{wakatime_top_language_percent}` | WakaTime |
| `{twitterFollowers}` | Twitter/X followers (manual input by default) |
| `{codestatsXP}` | Code::Stats XP |

---

### Dynamic Chart Data

Inside a chart's `items` array you can put:

```jsonc
"items": "{wakatime_chart_data}"
```

and the build script will replace it with the top five languages from your last 7 days on WakaTime.

---

### 📊 Chart Recipe Example

```jsonc
{
  "sender": "me",
  "contentType": "chart",
  "chartData": {
    "type": "donut",
    "title": "{wakatime_top_language} usage",
    "centerText": "{wakatime_top_language_percent}%",
    "items": "{wakatime_chart_data}"
  }
}
```

---

## 🖼️ Embedding in Your Profile README

```markdown
![My Profile Chat](https://raw.githubusercontent.com/<you>/ProfileChatter/main/dist/profile-chat.svg?ts=1759796421{{CI_TIMESTAMP}})
```

Replace `<you>` with your GitHub username.  
Add `?ts=<any changing number>` (e.g. 1, 2, 3 …) to encourage GitHub to fetch the latest SVG after updates. The CI workflow automatically updates this timestamp for you.

---

## 🗜️ Local Commands

| Command | Description |
| --- | --- |
| `npm run build` | Render SVG to `dist/` using current config |
| `npm run preview` | Build & open `test.html` for a live animation preview |
| `npm run config:dev` | Launch the Configurator UI |
| `npm run format` | Prettier formatting |
| `npm run lint` | ESLint checks |
| `npm run test` | Run the comprehensive test suite |
| `npm run config:build` | Create a static build of the Configurator |

---

## 📺 See It in Action

- **Dan Johnson** – <https://github.com/dsj7419>

> **Show off yours!** Open a PR to add your profile to this list and inspire others.

---

## 🤝 Contributing

PRs are welcome! We have a comprehensive test suite (~400+ tests) integrated into CI. Please ensure any backend code contributions include relevant tests.

**Ideas for contributions:**

- New themes (WhatsApp, Telegram, custom designs...)
- Extra data sources (Dev.to posts, Stack Overflow rep, etc.)
- Advanced theming tools (e.g. helpers to design themes that adapt to light/dark OS modes)
- Documentation improvements
- Performance & build‑time optimisations

**Getting started:**

- Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
- Feel free to open an issue using our Bug Report or Feature Request templates
- All contributions are welcome, from bug fixes to new features!

---

## 📝 License

[UNLICENSE](LICENSE) – public domain, no strings attached.

---

## 🙌 Acknowledgements

AccuWeather API • GitHub API • WakaTime • Twitter/X API • Code::Stats • Node.js • Svelte • Tailwind CSS – and **you** for building something awesome.
