# ProfileChatter

> **Animated chat bubbles that talk for you** – a fully‑automated SVG generator that drops a live, messaging‑style panel into your GitHub&nbsp;profile.  
> Powered by Node 20, GitHub Actions, and a **zero‑config Configurator UI**.

![ProfileChatter Demo](https://raw.githubusercontent.com/dsj7419/ProfileChatter/main/dist/profile-chat.svg?ts=1747634838)

---

## 🌟 Why ProfileChatter?

*Static README badges are yesterday’s news.*  
ProfileChatter turns your profile into a **living conversation** that updates itself – showcasing your latest repos, current weather, coding activity, social reach, and more. Set it up once, and your profile keeps talking.

---

## ✨ Highlights

| | |
| --- | --- |
| **Live data on display** | GitHub repos & followers, local weather, WakaTime stats, Twitter/X followers, Code::Stats XP – plug‑and‑play, no code required |
| **No‑code Configurator UI** | `npm run config:dev` launches a Svelte app to visually customise messages, themes, avatars, charts & more |
| **Dynamic charts** | Donut & horizontal‑bar charts with per‑segment animation – auto‑generated from WakaTime or any JSON array |
| **Themes that fit in** | iOS & Android styles out of the box – add your own with a single theme object in `config.js` *or* through the UI |
| **Smooth, adaptive animations** | Dynamic scroll easing, typing indicators, bubble pop‑ins, chart draw effects |
| **Quick, safe builds** | GitHub Actions rebuild every 6 h (or on push) with runtime config validation |

---

## 🛠 How it Works

1. **GitHub Actions** (`.github/workflows/main.yml`) run on a 6‑hour cron or any push.  
2. **Node scripts** fetch data and render a fresh SVG to `dist/`.  
3. **TimelineBuilder → SvgRenderer** convert chatData + config into animated markup.  
4. **Configurator UI** writes `profileChatterConfig.json`; when present it overrides `src/config/config.js`.

---

## 🚀 Quick Start

```bash
# 1 – Fork the repo, then clone your fork
git clone https://github.com/<you>/ProfileChatter.git
cd ProfileChatter

# 2 – Install dependencies & view the default output
npm install
npm run build
#  └─ open dist/profile-chat.svg to preview the out‑of‑the‑box experience

# 3 – Launch the Configurator UI
npm run config:dev
#  └─ edit profile, theme, avatars, chat messages, charts…
#  └─ click **Export Configuration** → profileChatterConfig.json

# 4 – Copy the exported profileChatterConfig.json to the project root directory, commit & push
git add profileChatterConfig.json
git commit -m "feat: personalise ProfileChatter"
git push
```

> **Tip:** For local work, create a `.env` from `.env.template` and drop your API keys there.

---

## 🔑 Repository Secrets / Env Variables

| Key | Required | Purpose |
| --- | :---: | --- |
| `WEATHER_API_KEY` | ✔ | AccuWeather API key |
| `LOCATION_KEY` | ✔ | AccuWeather location key |
| `GITHUB_TOKEN` | ☐ | Avoid unauthenticated GitHub rate‑limits (handy for frequent builds) |
| `WAKATIME_API_KEY` | ☐ | Show WakaTime stats & **dynamic** charts |
| `TWITTER_BEARER_TOKEN` | ☐ | Fetch Twitter/X follower count |
| *(none)* | ☐ | Code::Stats needs only the username |

For **local development** (`npm run build`, Configurator preview) place these in a `.env` file instead of repository secrets.

---

## 💻 Manual Configuration (optional)

Prefer writing JSON in the UI, but you can hand‑edit `src/config/config.js`:

* **Themes** – copy an existing object, rename it (e.g. `myCustomTheme`), change colors & fonts, then set `activeTheme: "myCustomTheme"`.  
* **Layout & animation** – tweak bubble padding, scroll speed, chart timing, etc.  
* **Disable integrations** – e.g. set `wakatime.enabled = false` to turn WakaTime off.

---

## 💬 Message Placeholders

| Placeholder | Injected value |
| --- | --- |
| `{name}` / `{profession}` / `{location}` / `{company}` | Profile details |
| `{workTenure}` | Human‑readable tenure – e.g. “1 year 2 months” |
| `{currentDayOfWeek}` / `{currentDate}` | Localised date strings |
| `{temperature}` / `{weatherDescription}` / `{emoji}` | Current weather |
| `{githubPublicRepos}` / `{githubFollowers}` | GitHub stats |
| `{wakatime_summary}` / `{wakatime_top_language}` / `{wakatime_top_language_percent}` | WakaTime |
| `{twitterFollowers}` | Twitter/X followers |
| `{codestatsXP}` | Code::Stats XP |

---

### Dynamic Chart Data

Inside a chart’s `items` array you can put:

```jsonc
"items": "{wakatime_chart_data}"
```

and the build script will replace it with the top five languages from your last 7 days on WakaTime.

---

### 📊 Chart Recipe Example

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

## 🖼 Embedding in Your Profile README

```markdown
![My Profile Chat](https://raw.githubusercontent.com/<you>/ProfileChatter/main/dist/profile-chat.svg?ts=1747634838)
```

Replace `<you>` with your GitHub username.  
Add `?ts=<any changing number>` (e.g. 1, 2, 3 …) to encourage GitHub to fetch the latest SVG after updates.

---

## 🗜 Local Commands

| Command | Description |
| --- | --- |
| `npm run build` | Render SVG to `dist/` using current config |
| `npm run preview` | Build & open `test.html` for a live animation preview |
| `npm run config:dev` | Launch the Configurator UI |
| `npm run format` | Prettier formatting |
| `npm run lint` | ESLint checks |
| `npm run config:build` | Create a static build of the Configurator |

---

## 📺 See It in Action

* **Dan Johnson** – <https://github.com/dsj7419>

> **Show off yours!** Open a PR to add your profile to this list and inspire others.

---

## 🤝 Contributing

PRs are welcome. Ideas:

* New themes (WhatsApp, Discord, Telegram…)
* Extra data sources (Dev.to posts, Stack Overflow rep, etc.)
* Advanced theming tools (e.g. helpers to design themes that adapt to light/dark OS modes)
* Documentation improvements
* Performance & build‑time optimisations

---

## 📝 License

[UNLICENSE](LICENSE) – public domain, no strings attached.

---

## 🙌 Acknowledgements

AccuWeather API • GitHub API • WakaTime • Twitter/X API • Code::Stats • Node.js • Svelte • Tailwind CSS – and **you** for building something awesome.
