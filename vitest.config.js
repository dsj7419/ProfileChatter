import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tests/coverage',
      include: ['src/**/*.js'],
      exclude: [
        'src/main.js',
        'src/build-profile.js',
        'src/config/timezones.js', // Pure data
        'src/rendering/fontData.js', // Pure data
        'src/routes/**', // Express routes for OAuth, test via integration/e2e
        // Consider excluding other config files if they are just data exports
        'src/config/config.js', // This is mostly data, but ConfigValidator tests will use it indirectly
      ],
      all: true, // Attempt to include all files from `include` in report, even if no tests yet
      // Ratcheting floor for src/** (currently ~90.5% stmts / 85.7% branch / 98% funcs).
      // Set conservatively below current to lock in the gain without flakiness; raise over time.
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 95,
        lines: 85,
      },
    },
    // Optional: if we need global setup for mocks later
    // setupFiles: ['./tests/setupTests.js'],
  },
})
