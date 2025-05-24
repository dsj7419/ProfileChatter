/**
 * Unit tests for AvatarRenderer.js
 * Tests avatar rendering with different configurations
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AvatarRenderer from '../../../../../src/rendering/components/AvatarRenderer.js';

// Mock dependencies
vi.mock('../../../../../src/config/config.js', () => ({
  config: {
    avatars: {
      me: { 
        imageUrl: 'data:image/png;base64,mockImageData',
        fallbackText: 'DJ' 
      },
      visitor: { 
        imageUrl: '',
        fallbackText: '?' 
      },
      sizePx: 32,
      shape: 'circle'
    }
  }
}));

vi.mock('../../../../../src/utils/TextProcessor.js', () => ({
  default: {
    escapeXML: vi.fn(text => text)
  }
}));

describe('AvatarRenderer', () => {
  let mockConfig;
  let mockTextProcessor;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get mocked modules
    mockConfig = vi.mocked(await import('../../../../../src/config/config.js')).config;
    mockTextProcessor = vi.mocked(await import('../../../../../src/utils/TextProcessor.js')).default;
    
    // Reset to default test configuration
    mockConfig.avatars = {
      me: { 
        imageUrl: 'data:image/png;base64,mockImageData',
        fallbackText: 'DJ' 
      },
      visitor: { 
        imageUrl: '',
        fallbackText: '?' 
      },
      sizePx: 32,
      shape: 'circle'
    };
  });

  describe('render', () => {
    it('should render avatar group with correct transform and style', () => {
      const result = AvatarRenderer.render('me', {}, 10, 20, 'animation-delay:1.5s');

      expect(result).toContain('<g class="avatar"');
      expect(result).toContain('transform="translate(10,20)"');
      expect(result).toContain('style="animation-delay:1.5s"');
      expect(result).toContain('</g>');
    });

    it('should include avatar content from _renderAvatarContent', () => {
      const result = AvatarRenderer.render('me', {}, 0, 0, '');

      // Should contain image tag for valid data URI
      expect(result).toContain('<image href="data:image/png;base64,mockImageData"');
      expect(result).toContain('width="32" height="32"');
      expect(result).toContain('clip-path="url(#avatarCircle)"');
    });
  });

  describe('_renderAvatarContent', () => {
    it('should render image for valid data URI (me)', () => {
      const result = AvatarRenderer._renderAvatarContent('me', {});

      expect(result).toContain('<image href="data:image/png;base64,mockImageData"');
      expect(result).toContain('width="32" height="32"');
      expect(result).toContain('clip-path="url(#avatarCircle)"');
    });

    it('should render image for valid data URI (visitor)', () => {
      mockConfig.avatars.visitor.imageUrl = 'data:image/jpeg;base64,visitorImageData';
      
      const result = AvatarRenderer._renderAvatarContent('visitor', {});

      expect(result).toContain('<image href="data:image/jpeg;base64,visitorImageData"');
      expect(result).toContain('clip-path="url(#avatarCircle)"');
    });

    it('should render image for external HTTP URL with warning', () => {
      mockConfig.avatars.me.imageUrl = 'https://example.com/avatar.png';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = AvatarRenderer._renderAvatarContent('me', {});

      expect(result).toContain('<image href="https://example.com/avatar.png"');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('External URL "https://example.com/avatar.png" used for me avatar')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Base64 encoded data URIs are recommended')
      );
      
      consoleSpy.mockRestore();
    });

    it('should render image for external HTTPS URL with warning', () => {
      mockConfig.avatars.visitor.imageUrl = 'http://example.com/visitor.jpg';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = AvatarRenderer._renderAvatarContent('visitor', {});

      expect(result).toContain('<image href="http://example.com/visitor.jpg"');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('External URL "http://example.com/visitor.jpg" used for visitor avatar')
      );
      
      consoleSpy.mockRestore();
    });

    it('should render fallback text for empty imageUrl', () => {
      mockConfig.avatars.me.imageUrl = '';
      const theme = {
        ME_BUBBLE_COLOR: '#0B93F6',
        ME_TEXT_COLOR: '#FFFFFF',
        FONT_FAMILY: 'Arial'
      };

      const result = AvatarRenderer._renderAvatarContent('me', theme);

      expect(result).toContain('<rect width="32" height="32"');
      expect(result).toContain('fill="#0B93F6"');
      expect(result).toContain('<text x="16" y="16"');
      expect(result).toContain('fill="#FFFFFF"');
      expect(result).toContain('font-family="Arial"');
      expect(result).toContain('>DJ</text>');
      expect(mockTextProcessor.escapeXML).toHaveBeenCalledWith('DJ');
    });

    it('should render fallback text for invalid imageUrl', () => {
      mockConfig.avatars.visitor.imageUrl = 'invalid-url';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const theme = {
        VISITOR_BUBBLE_COLOR: '#E5E5EA',
        VISITOR_TEXT_COLOR: '#000000',
        FONT_FAMILY: 'Helvetica'
      };

      const result = AvatarRenderer._renderAvatarContent('visitor', theme);

      expect(result).toContain('<rect width="32" height="32"');
      expect(result).toContain('fill="#E5E5EA"');
      expect(result).toContain('fill="#000000"');
      expect(result).toContain('>?</text>');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid image URL format for visitor avatar')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle circle shape clip-path', () => {
      mockConfig.avatars.shape = 'circle';
      
      const result = AvatarRenderer._renderAvatarContent('me', {});

      expect(result).toContain('clip-path="url(#avatarCircle)"');
    });

    it('should handle square shape clip-path', () => {
      mockConfig.avatars.shape = 'square';
      
      const result = AvatarRenderer._renderAvatarContent('me', {});

      expect(result).toContain('clip-path="url(#avatarSquare)"');
    });

    it('should handle different avatar sizes', () => {
      mockConfig.avatars.sizePx = 48;
      
      const result = AvatarRenderer._renderAvatarContent('me', {});

      expect(result).toContain('width="48" height="48"');
    });

    it('should use correct radius for circle vs square fallback', () => {
      mockConfig.avatars.me.imageUrl = '';
      mockConfig.avatars.sizePx = 40;
      
      // Circle shape should use half size as radius
      mockConfig.avatars.shape = 'circle';
      let result = AvatarRenderer._renderAvatarContent('me', { ME_BUBBLE_COLOR: '#000', ME_TEXT_COLOR: '#fff', FONT_FAMILY: 'Arial' });
      expect(result).toContain('rx="20" ry="20"');
      
      // Square shape should use fixed radius of 4
      mockConfig.avatars.shape = 'square';
      result = AvatarRenderer._renderAvatarContent('me', { ME_BUBBLE_COLOR: '#000', ME_TEXT_COLOR: '#fff', FONT_FAMILY: 'Arial' });
      expect(result).toContain('rx="4" ry="4"');
    });

    it('should escape XML in fallback text', () => {
      mockConfig.avatars.me.imageUrl = '';
      mockConfig.avatars.me.fallbackText = '<script>alert("xss")</script>';
      mockTextProcessor.escapeXML.mockReturnValue('&lt;script&gt;alert("xss")&lt;/script&gt;');
      
      const result = AvatarRenderer._renderAvatarContent('me', { ME_BUBBLE_COLOR: '#000', ME_TEXT_COLOR: '#fff', FONT_FAMILY: 'Arial' });

      expect(mockTextProcessor.escapeXML).toHaveBeenCalledWith('<script>alert("xss")</script>');
      expect(result).toContain('>&lt;script&gt;alert("xss")&lt;/script&gt;</text>');
    });
  });
});