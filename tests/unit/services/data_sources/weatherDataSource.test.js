// tests/unit/services/data_sources/weatherDataSource.test.js - COMPLETELY FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

// Mock the config module
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    cache: {
      WEATHER_CACHE_TTL_MS: 1800000
    },
    apiDefaults: {
      TEMPERATURE: "72°F (22°C)",
      WEATHER_DESCRIPTION: "partly cloudy",
      WEATHER_EMOJI: "⛅"
    }
  }
}));

describe('weatherDataSource', () => {
  let mockFetch;
  let getWeatherData;
  let config;
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset environment
    process.env = { ...originalEnv };
    process.env.WEATHER_API_KEY = 'test-api-key';
    process.env.LOCATION_KEY = 'test-location-key';
    
    // Clear the module cache and re-import to reset module-level cache
    vi.resetModules();
    
    // Import fresh modules
    const configModule = await import('../../../../src/config/config.js');
    config = configModule.config;
    
    const module = await import('../../../../src/services/data_sources/weatherDataSource.js');
    getWeatherData = module.getWeatherData;
    
    // Setup fetch mock
    mockFetch = vi.fn();
    if (typeof fetch === 'undefined') {
      global.fetch = undefined;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    process.env = originalEnv;
    if (global.fetch === undefined) {
      delete global.fetch;
    }
  });

  describe('Successful API Fetch & Caching', () => {
    it('should fetch weather data successfully in browser environment', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          Temperature: {
            Imperial: { Value: 75 }
          },
          WeatherText: 'Sunny'
        }]
      });

      const result = await getWeatherData();

      expect(mockFetch).toHaveBeenCalledWith(
        `https://dataservice.accuweather.com/currentconditions/v1/test-location-key?apikey=test-api-key`
      );
      expect(result).toEqual({
        temperature: '75°F (24°C)',
        weatherDescription: 'sunny',
        emoji: '☀️'
      });
    });

    it('should fetch weather data successfully in Node environment', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          Temperature: {
            Imperial: { Value: 32 }
          },
          WeatherText: 'Snow'
        }]
      });

      const result = await getWeatherData();

      expect(nodeFetch).toHaveBeenCalled();
      expect(result).toEqual({
        temperature: '32°F (0°C)',
        weatherDescription: 'snow',
        emoji: '❄️'
      });
    });

    it('should return cached data on second call', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          Temperature: { Imperial: { Value: 70 } },
          WeatherText: 'Partly Cloudy'
        }]
      });

      // First call
      const result1 = await getWeatherData();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call immediately
      const result2 = await getWeatherData();
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1
      expect(result2).toEqual(result1);
    });

    it('should fetch new data after cache expires', async () => {
      global.fetch = mockFetch;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{
            Temperature: { Imperial: { Value: 65 } },
            WeatherText: 'Clear'
          }]
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{
            Temperature: { Imperial: { Value: 80 } },
            WeatherText: 'Hot'
          }]
        });

      // First call
      await getWeatherData();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time past cache TTL
      vi.advanceTimersByTime(config.cache.WEATHER_CACHE_TTL_MS + 1000);

      // Second call after cache expiry
      const result = await getWeatherData();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.temperature).toBe('80°F (27°C)');
    });
  });

  describe('API Error Handling', () => {
    it('should handle 401 Unauthorized error', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await getWeatherData();

      expect(result).toEqual({
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI
      });
    });

    it('should handle 429 Rate Limit error', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await getWeatherData();

      expect(result).toEqual({
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI
      });
    });

    it('should handle network errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getWeatherData();

      expect(result).toEqual({
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI
      });
    });

    it('should handle empty API response', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const result = await getWeatherData();

      expect(result).toEqual({
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI
      });
    });
  });

  describe('Missing Environment Variables', () => {
    it('should handle missing API key', async () => {
      delete process.env.WEATHER_API_KEY;
      global.fetch = mockFetch;

      const result = await getWeatherData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI
      });
    });

    it('should handle missing location key', async () => {
      delete process.env.LOCATION_KEY;
      global.fetch = mockFetch;

      const result = await getWeatherData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI
      });
    });
  });

  describe('Weather Emoji Processing', () => {
    const weatherEmojiTests = [
      { text: 'Sunny', emoji: '☀️' },
      { text: 'Clear skies', emoji: '☀️' },
      { text: 'Mostly Sunny', emoji: '🌤️' },  // FIXED: Now correctly matches "mostly sunny" with improved logic
      { text: 'Partly Cloudy', emoji: '⛅' },
      { text: 'Cloudy', emoji: '☁️' },
      { text: 'Rain', emoji: '🌧️' },
      { text: 'Thunderstorm', emoji: '⛈️' },
      { text: 'Snow', emoji: '❄️' },
      { text: 'Fog', emoji: '🌫️' },
      { text: 'Unknown Weather', emoji: '⛅' } // Default
    ];

    weatherEmojiTests.forEach(({ text, emoji }) => {
      it(`should return ${emoji} for "${text}"`, async () => {
        global.fetch = mockFetch;
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [{
            Temperature: { Imperial: { Value: 70 } },
            WeatherText: text
          }]
        });

        const result = await getWeatherData();
        expect(result.emoji).toBe(emoji);
      });
    });
  });
});