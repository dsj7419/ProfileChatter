<script>
    import { userConfig, workStartDate } from '../stores/configStore.js';
    
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
            bind:value={$userConfig.profile.NAME} 
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
            bind:value={$userConfig.profile.PROFESSION} 
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
            bind:value={$userConfig.profile.LOCATION} 
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
            bind:value={$userConfig.profile.COMPANY} 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Your company or organization"
          />
        </div>
        
        <!-- CURRENT_PROJECT -->
        <div>
          <label for="current-project" class="block text-sm font-medium text-gray-700 mb-1">Current Project</label>
          <input 
            type="text" 
            id="current-project" 
            bind:value={$userConfig.profile.CURRENT_PROJECT} 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="What are you working on?"
          />
        </div>
      </div>
      
      <!-- Work Start Date Section -->
      <div class="p-3 border border-gray-200 rounded-md bg-white">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Work Start Date</h3>
        
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
      
      <!-- Social Profiles Section -->
      <div class="p-3 border border-gray-200 rounded-md bg-white">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Social & Coding Profiles</h3>
        
        <!-- GITHUB_USERNAME -->
        <div class="mb-3">
          <label for="github" class="block text-sm font-medium text-gray-700 mb-1">GitHub Username</label>
          <input 
            type="text" 
            id="github" 
            bind:value={$userConfig.profile.GITHUB_USERNAME} 
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
          <label for="wakatime" class="block text-sm font-medium text-gray-700 mb-1">WakaTime Username</label>
          <input 
            type="text" 
            id="wakatime" 
            bind:value={$userConfig.profile.WAKATIME_USERNAME} 
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
          <label for="twitter" class="block text-sm font-medium text-gray-700 mb-1">Twitter Username</label>
          <input 
            type="text" 
            id="twitter" 
            bind:value={$userConfig.profile.TWITTER_USERNAME} 
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
          <label for="codestats" class="block text-sm font-medium text-gray-700 mb-1">Code::Stats Username</label>
          <input 
            type="text" 
            id="codestats" 
            bind:value={$userConfig.profile.CODESTATS_USERNAME} 
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