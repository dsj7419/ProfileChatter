// tests/unit/helpers/cacheHelper.js
export function clearModuleCache() {
    // Clear all module-level caches by deleting and re-importing modules
    const modulesToClear = [
      '../../../../src/services/data_sources/weatherDataSource.js',
      '../../../../src/services/data_sources/githubDataSource.js',
      '../../../../src/services/data_sources/codestatsDataSource.js',
      '../../../../src/services/data_sources/twitterDataSource.js',
      '../../../../src/services/data_sources/wakatimeDataSource.js',
      '../../../../src/services/data_sources/spotifyDataSource.js',
      '../../../../src/services/data_sources/githubOAuthDataSource.js'
    ];
    
    modulesToClear.forEach(modulePath => {
      const resolvedPath = require.resolve(modulePath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
    });
  }
  