<script>
  import { userConfig, workStartDate } from '../stores/configStore.js';
  import HelpIconTooltip from '../lib/ui/HelpIconTooltip.svelte';
  import { timezones } from '../../../src/config/timezones.js';
  
  // Helper functions
  function isValidUsername(username) {
    // Allow empty or valid GitHub username format
    if (username === '') return true;
    return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username);
  }
  
  // Form validation state
  let formErrors = {
    GITHUB_USERNAME: false,
    WAKATIME_USERNAME: false,
    TWITTER_USERNAME: false,
    CODESTATS_USERNAME: false,
    workStartDate: false
  };
  
  // Ensure profile updates trigger reactivity by creating a new object reference
  function updateProfileField(field, value) {
    $userConfig = {
      ...$userConfig,
      profile: {
        ...$userConfig.profile,
        [field]: value
      }
    };
  }
  
  // Update weather config
  function updateWeatherField(field, value) {
    $userConfig = {
      ...$userConfig,
      weather: {
        ...$userConfig.weather,
        [field]: value
      }
    };
  }
  
  // Validate GitHub username
  $: formErrors.GITHUB_USERNAME = !isValidUsername($userConfig.profile.GITHUB_USERNAME);
  
  // Validate Wakatime username
  $: formErrors.WAKATIME_USERNAME = !isValidUsername($userConfig.profile.WAKATIME_USERNAME);
  
  // Validate Twitter username
  $: formErrors.TWITTER_USERNAME = !isValidUsername($userConfig.profile.TWITTER_USERNAME);
  
  // Validate CodeStats username
  $: formErrors.CODESTATS_USERNAME = !isValidUsername($userConfig.profile.CODESTATS_USERNAME);
  
  // Validate work start date
  $: {
    const year = $workStartDate.year;
    const month = $workStartDate.month;
    const day = $workStartDate.day;
    
    // Basic date validation
    const isValidYear = year >= 1900 && year <= new Date().getFullYear();
    const isValidMonth = month >= 1 && month <= 12;
    
    // Calculate days in month
    let daysInMonth = 31;
    if ([4, 6, 9, 11].includes(month)) {
      daysInMonth = 30;
    } else if (month === 2) {
      // February - check for leap year
      daysInMonth = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28;
    }
    
    const isValidDay = day >= 1 && day <= daysInMonth;
    
    formErrors.workStartDate = !(isValidYear && isValidMonth && isValidDay);
  }
  
  // Check if the form has any validation errors
  $: hasErrors = Object.values(formErrors).some(error => error === true);
</script>

<div class="p-4">
  <h2 class="text-lg font-medium mb-4">Profile Settings</h2>
  
  <form class="space-y-4">
    <!-- Personal Information Section -->
    <div class="p-3 border border-gray-200 rounded-md bg-white">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
      
      <!-- NAME -->
      <div class="mb-3">
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input 
          type="text" 
          id="name" 
          value={$userConfig.profile.NAME}
          on:input={(e) => updateProfileField('NAME', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="Your full name"
        />
      </div>
      
      <!-- PROFESSION -->
      <div class="mb-3">
        <label for="profession" class="block text-sm font-medium text-gray-700 mb-1">Profession</label>
        <input 
          type="text" 
          id="profession" 
          value={$userConfig.profile.PROFESSION}
          on:input={(e) => updateProfileField('PROFESSION', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="Your job title"
        />
      </div>
      
      <!-- LOCATION -->
      <div class="mb-3">
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input 
          type="text" 
          id="location" 
          value={$userConfig.profile.LOCATION}
          on:input={(e) => updateProfileField('LOCATION', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="City, Country"
        />
      </div>
      
      <!-- COMPANY -->
      <div class="mb-3">
        <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <input 
          type="text" 
          id="company" 
          value={$userConfig.profile.COMPANY}
          on:input={(e) => updateProfileField('COMPANY', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="Your company or organization"
        />
      </div>
      
      <!-- CURRENT_PROJECT -->
      <div class="mb-3">
        <label for="current-project" class="block text-sm font-medium text-gray-700 mb-1">Current Project</label>
        <input 
          type="text" 
          id="current-project" 
          value={$userConfig.profile.CURRENT_PROJECT}
          on:input={(e) => updateProfileField('CURRENT_PROJECT', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="What are you working on?"
        />
      </div>
      
      <!-- TIMEZONE -->
      <div>
        <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">
          Timezone
          <HelpIconTooltip text="Select your preferred timezone for date and time formatting in your profile." />
        </label>
        <select 
          id="timezone" 
          bind:value={$userConfig.profile.TIMEZONE}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          {#each timezones as timezone}
            <option value={timezone.value}>{timezone.label}</option>
          {/each}
        </select>
        <p class="mt-1 text-xs text-gray-500">This affects how dates and times are displayed in your profile</p>
      </div>
    </div>
    
    <!-- Work Start Date Section -->
    <div class="p-3 border border-gray-200 rounded-md bg-white">
      <h3 class="text-sm font-medium text-gray-700 mb-3">
        Work Start Date
        <HelpIconTooltip text="This date is used to calculate your work tenure duration, which can be displayed in your profile using a special placeholder variable." />
      </h3>
      
      <div class="grid grid-cols-3 gap-2">
        <!-- YEAR -->
        <div>
          <label for="year" class="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input 
            type="number" 
            id="year" 
            bind:value={$workStartDate.year} 
            min="1900"
            max={new Date().getFullYear()}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <!-- MONTH -->
        <div>
          <label for="month" class="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <input 
            type="number" 
            id="month" 
            bind:value={$workStartDate.month}
            min="1"
            max="12"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <!-- DAY -->
        <div>
          <label for="day" class="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <input 
            type="number" 
            id="day" 
            bind:value={$workStartDate.day}
            min="1"
            max="31"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      
      {#if formErrors.workStartDate}
        <p class="mt-2 text-sm text-red-600">Please enter a valid date</p>
      {/if}
    </div>

    <!-- Integration Settings Section -->
    <div class="p-3 border border-gray-200 rounded-md bg-white">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Integration Settings</h3>
      
      <!-- Weather Integration Toggle -->
      <div class="mb-3">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            checked={$userConfig.weather?.enabled || false}
            on:change={(e) => updateWeatherField('enabled', e.target.checked)}
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span class="ml-2 text-sm font-medium text-gray-700">
            Enable Weather Integration
            <HelpIconTooltip text="When enabled, ProfileChatter will fetch current weather data from AccuWeather API. Requires WEATHER_API_KEY and LOCATION_KEY environment variables. When disabled, default weather values will be used." />
          </span>
        </label>
        <p class="mt-1 text-xs text-gray-500">
          {#if $userConfig.weather?.enabled}
            Weather data will be fetched from AccuWeather API (requires API keys)
          {:else}
            Default weather values will be used
          {/if}
        </p>
      </div>
    </div>
    
    <!-- Social Profiles Section -->
    <div class="p-3 border border-gray-200 rounded-md bg-white">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Social & Coding Profiles</h3>
      
      <!-- GITHUB_USERNAME -->
      <div class="mb-3">
        <label for="github" class="block text-sm font-medium text-gray-700 mb-1">
          GitHub Username
          <HelpIconTooltip text="Your public GitHub username, used for API calls to fetch repository and follower counts. Required for many ProfileChatter features." />
        </label>
        <input 
          type="text" 
          id="github" 
          value={$userConfig.profile.GITHUB_USERNAME}
          on:input={(e) => updateProfileField('GITHUB_USERNAME', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
          class:border-red-500={formErrors.GITHUB_USERNAME}
          placeholder="your_github"
        />
        {#if formErrors.GITHUB_USERNAME}
          <p class="mt-1 text-xs text-red-600">Please enter a valid GitHub username</p>
        {/if}
      </div>
      
      <!-- WAKATIME_USERNAME -->
      <div class="mb-3">
        <label for="wakatime" class="block text-sm font-medium text-gray-700 mb-1">
          WakaTime Username
          <HelpIconTooltip text="Connect your WakaTime account to display coding stats in your profile. WakaTime tracks your programming activity across different editors." />
        </label>
        <input 
          type="text" 
          id="wakatime" 
          value={$userConfig.profile.WAKATIME_USERNAME}
          on:input={(e) => updateProfileField('WAKATIME_USERNAME', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          class:border-red-500={formErrors.WAKATIME_USERNAME}
          placeholder="your_wakatime"
        />
        {#if formErrors.WAKATIME_USERNAME}
          <p class="mt-1 text-xs text-red-600">Please enter a valid WakaTime username</p>
        {/if}
        <p class="mt-1 text-xs text-gray-500">Leave empty to disable WakaTime integration</p>
      </div>
      
      <!-- TWITTER_USERNAME -->
      <div class="mb-3">
        <label for="twitter" class="block text-sm font-medium text-gray-700 mb-1">
          Twitter Username
          <HelpIconTooltip text="Your Twitter/X username, used to display your follower count and connect your social profile." />
        </label>
        <input 
          type="text" 
          id="twitter" 
          value={$userConfig.profile.TWITTER_USERNAME}
          on:input={(e) => updateProfileField('TWITTER_USERNAME', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          class:border-red-500={formErrors.TWITTER_USERNAME}
          placeholder="your_twitter"
        />
        {#if formErrors.TWITTER_USERNAME}
          <p class="mt-1 text-xs text-red-600">Please enter a valid Twitter username</p>
        {/if}
        <p class="mt-1 text-xs text-gray-500">Leave empty to disable Twitter integration</p>
      </div>
      
      <!-- CODESTATS_USERNAME -->
      <div>
        <label for="codestats" class="block text-sm font-medium text-gray-700 mb-1">
          Code::Stats Username
          <HelpIconTooltip text="Code::Stats is a free service that tracks your programming metrics, including experience points (XP) earned while coding in different languages." />
        </label>
        <input 
          type="text" 
          id="codestats" 
          value={$userConfig.profile.CODESTATS_USERNAME}
          on:input={(e) => updateProfileField('CODESTATS_USERNAME', e.target.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          class:border-red-500={formErrors.CODESTATS_USERNAME}
          placeholder="your_codestats"
        />
        {#if formErrors.CODESTATS_USERNAME}
          <p class="mt-1 text-xs text-red-600">Please enter a valid Code::Stats username</p>
        {/if}
        <p class="mt-1 text-xs text-gray-500">Leave empty to disable Code::Stats integration</p>
      </div>
    </div>
  </form>
</div>