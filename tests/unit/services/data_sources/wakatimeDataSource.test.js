// tests/unit/services/data_sources/wakatimeDataSource.test.js - COMPLETELY FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

vi.mock('../../../../src/services/utils/languageColors.js', () => ({
  getLanguageColor: vi.fn(lang => `#${lang.toLowerCase()}`)
}));

// Mock the config module
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    wakatime: {
      enabled: true,
      defaults: {
        wakatime_summary: "No coding activity data available",
        wakatime_top_language: "N/A",
        wakatime_top_language_percent: "0",
        wakatime_chart_data: []
      },
      cacheTtlMs: 7200000
    },
    profile: {
      WAKATIME_USERNAME: 'testuser' // Default test value
    }
  }
}));

describe('wakatimeDataSource', () => {
  let mockFetch;
  let getWakaTimeData;
  let config;
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset module
    vi.resetModules();
    
    process.env = { ...originalEnv };
    process.env.WAKATIME_API_KEY = 'test-api-key';
    
    // Import fresh modules
    const configModule = await import('../../../../src/config/config.js');
    config = configModule.config;
    
    // Set default test values
    config.wakatime.enabled = true;
    config.profile.WAKATIME_USERNAME = 'testuser';
    
    const module = await import('../../../../src/services/data_sources/wakatimeDataSource.js');
    getWakaTimeData = module.getWakaTimeData;
    
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

  describe('Configuration Checks', () => {
    it('should skip when WakaTime is disabled', async () => {
      config.wakatime.enabled = false;
      global.fetch = mockFetch;

      const result = await getWakaTimeData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should handle missing API key', async () => {
      delete process.env.WAKATIME_API_KEY;
      global.fetch = mockFetch;

      const result = await getWakaTimeData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual(config.wakatime.defaults);
    });

    it('should handle missing username', async () => {
      config.profile.WAKATIME_USERNAME = '';
      global.fetch = mockFetch;

      const result = await getWakaTimeData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual(config.wakatime.defaults);
    });
  });

  describe('Successful API Fetch & Caching', () => {
    it('should fetch WakaTime data successfully in browser', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            human_readable_total_including_other_language: '25 hrs 30 mins',
            languages: [
              { name: 'JavaScript', percent: 65.5 },
              { name: 'Python', percent: 20.3 },
              { name: 'HTML', percent: 14.2 }
            ]
          }
        })
      });

      const result = await getWakaTimeData();

      expect(global.btoa).toHaveBeenCalledWith('test-api-key');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://wakatime.com/api/v1/users/testuser/stats/last_7_days',
        {
          headers: {
            'Authorization': 'Basic dGVzdC1hcGkta2V5',
            'Accept': 'application/json'
          }
        }
      );
      expect(result).toEqual({
        wakatime_summary: 'Coded for 25 hrs 30 mins in the last week',
        wakatime_top_language: 'JavaScript',
        wakatime_top_language_percent: '66',
        wakatime_chart_data: [
          { label: 'JavaScript', value: 66, color: '#javascript' },
          { label: 'Python', value: 20, color: '#python' },
          { label: 'HTML', value: 14, color: '#html' }
        ]
      });
    });

    it('should handle empty languages array', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            human_readable_total_including_other_language: '0 hrs',
            languages: []
          }
        })
      });

      const result = await getWakaTimeData();

      expect(result).toEqual({
        wakatime_summary: 'Coded for 0 hrs in the last week',
        wakatime_top_language: 'None',
        wakatime_top_language_percent: '0',
        wakatime_chart_data: []
      });
    });

    it('should limit chart data to top 5 languages', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      const languages = Array(10).fill(null).map((_, i) => ({
        name: `Lang${i}`,
        percent: 10 - i
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            human_readable_total_including_other_language: '40 hrs',
            languages
          }
        })
      });

      const result = await getWakaTimeData();

      expect(result.wakatime_chart_data).toHaveLength(5);
      expect(result.wakatime_chart_data[0].label).toBe('Lang0');
      expect(result.wakatime_chart_data[4].label).toBe('Lang4');
    });

    it('should use cached data', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            human_readable_total_including_other_language: '10 hrs',
            languages: [{ name: 'Go', percent: 100 }]
          }
        })
      });

      await getWakaTimeData();
      const result = await getWakaTimeData();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.wakatime_top_language).toBe('Go');
    });

    it('should refresh after cache expires', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              human_readable_total_including_other_language: '5 hrs',
              languages: [{ name: 'Rust', percent: 100 }]
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              human_readable_total_including_other_language: '10 hrs',
              languages: [{ name: 'Go', percent: 100 }]
            }
          })
        });

      await getWakaTimeData();
      vi.advanceTimersByTime(config.wakatime.cacheTtlMs + 1000);
      const result = await getWakaTimeData();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.wakatime_top_language).toBe('Go');
    });
  });

  describe('API Error Handling', () => {
    const errorTests = [
      { status: 401, description: 'Unauthorized' },
      { status: 403, description: 'Forbidden' },
      { status: 404, description: 'User not found' },
      { status: 429, description: 'Rate limit' },
      { status: 500, description: 'Server error' }
    ];

    errorTests.forEach(({ status, description }) => {
      it(`should handle ${status} ${description}`, async () => {
        global.fetch = mockFetch;
        global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
        
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
          statusText: description
        });

        const result = await getWakaTimeData();

        expect(result).toEqual(config.wakatime.defaults);
      });
    });

    it('should handle invalid response data', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await getWakaTimeData();

      expect(result).toEqual(config.wakatime.defaults);
    });

    it('should handle network errors', async () => {
      global.fetch = mockFetch;
      global.btoa = vi.fn(str => Buffer.from(str).toString('base64'));
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getWakaTimeData();

      expect(result).toEqual(config.wakatime.defaults);
    });
  });

  describe('Node Environment', () => {
    it('should use Buffer for auth in Node', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      
      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            human_readable_total_including_other_language: '15 hrs',
            languages: [{ name: 'TypeScript', percent: 100 }]
          }
        })
      });

      const result = await getWakaTimeData();

      expect(nodeFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic ')
          })
        })
      );
      expect(result.wakatime_top_language).toBe('TypeScript');
    });

    it('should handle Node environment errors', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockRejectedValueOnce(new Error('Node error'));

      const result = await getWakaTimeData();

      expect(result).toEqual(config.wakatime.defaults);
    });
  });
});