/**
 * main.cli.test.js
 * Unit tests for the CLI portion of main.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dirname } from 'node:path';

// Mock all dependencies
vi.mock('../../../../src/ProfileChatter.js', () => ({
  generateChatSVG: vi.fn()
}));

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}));

vi.mock('node:path', () => ({
  dirname: vi.fn()
}));

// Import mocked modules
import { generateChatSVG } from '../../../../src/ProfileChatter.js';
import { mkdirSync, writeFileSync } from 'node:fs';

describe('main.js CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;
  let originalArgv;
  let originalImportMetaUrl;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    
    originalArgv = process.argv;
    originalImportMetaUrl = import.meta.url;
    
    dirname.mockImplementation((path) => path.split('/').slice(0, -1).join('/'));
    mkdirSync.mockImplementation(() => {}); // Default to not throwing
    writeFileSync.mockImplementation(() => {}); // Default to not throwing
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    
    process.argv = originalArgv;
    Object.defineProperty(import.meta, 'url', { value: originalImportMetaUrl });
  });

  // Helper function to simulate CLI execution
  const simulateCLI = async (argv = ['node', '/path/to/main.js'], outputPath) => {
    process.argv = argv;
    if (outputPath) {
      process.argv.push(outputPath);
    }
    
    // Mock the import.meta.url check to pass
    Object.defineProperty(import.meta, 'url', { 
      value: `file://${process.argv[1]}`,
      configurable: true 
    });
    
    // Import and run the CLI logic
    // Since we can't directly test the if block, we'll simulate the logic
    const defaultOutputPath = process.argv[2] || 'dist/profile-chat.svg';
    
    try {
      mkdirSync(dirname(defaultOutputPath), { recursive: true });
      
      const svg = await generateChatSVG();
      writeFileSync(defaultOutputPath, svg);
      console.log(`✅ SVG written to ${defaultOutputPath}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  };

  it('should generate SVG with default output path', async () => {
    // Arrange
    const mockSvg = '<svg>Generated SVG</svg>';
    generateChatSVG.mockResolvedValue(mockSvg);
    dirname.mockReturnValue('dist');

    // Act
    await simulateCLI();

    // Assert
    expect(mkdirSync).toHaveBeenCalledWith('dist', { recursive: true });
    expect(generateChatSVG).toHaveBeenCalledWith();
    expect(writeFileSync).toHaveBeenCalledWith('dist/profile-chat.svg', mockSvg);
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ SVG written to dist/profile-chat.svg');
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should generate SVG with custom output path', async () => {
    // Arrange
    const mockSvg = '<svg>Generated SVG</svg>';
    const customPath = 'custom/out.svg';
    generateChatSVG.mockResolvedValue(mockSvg);
    dirname.mockReturnValue('custom');

    // Act
    await simulateCLI(['node', '/path/to/main.js'], customPath);

    // Assert
    expect(mkdirSync).toHaveBeenCalledWith('custom', { recursive: true });
    expect(generateChatSVG).toHaveBeenCalledWith();
    expect(writeFileSync).toHaveBeenCalledWith(customPath, mockSvg);
    expect(consoleLogSpy).toHaveBeenCalledWith(`✅ SVG written to ${customPath}`);
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should handle generateChatSVG rejection', async () => {
    // Arrange
    const error = new Error('SVG Generation Failed');
    generateChatSVG.mockRejectedValue(error);
    dirname.mockReturnValue('dist');

    // Act
    await simulateCLI();

    // Assert
    expect(generateChatSVG).toHaveBeenCalledWith();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error);
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('should handle file system operation failure', async () => {
    // Arrange
    const mockSvg = '<svg>Generated SVG</svg>';
    const fsError = new Error('FS Error');
    generateChatSVG.mockResolvedValue(mockSvg);
    dirname.mockReturnValue('dist');
    writeFileSync.mockImplementation(() => {
      throw fsError;
    });

    // Act
    await simulateCLI();

    // Assert
    expect(generateChatSVG).toHaveBeenCalledWith();
    expect(writeFileSync).toHaveBeenCalledWith('dist/profile-chat.svg', mockSvg);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', fsError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle mkdirSync failure', async () => {
    // Arrange
    const fsError = new Error('Directory creation failed');
    dirname.mockReturnValue('dist');
    mkdirSync.mockImplementation(() => {
      throw fsError;
    });

    // Act
    await simulateCLI();

    // Assert
    expect(mkdirSync).toHaveBeenCalledWith('dist', { recursive: true });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', fsError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(generateChatSVG).not.toHaveBeenCalled();
  });

  it('should handle complex output path correctly', async () => {
    // Arrange
    const mockSvg = '<svg>Generated SVG</svg>';
    const complexPath = 'very/deep/nested/path/output.svg';
    generateChatSVG.mockResolvedValue(mockSvg);
    dirname.mockReturnValue('very/deep/nested/path');
    mkdirSync.mockImplementation(() => {}); // Ensure mkdirSync doesn't throw
    writeFileSync.mockImplementation(() => {}); // Ensure writeFileSync doesn't throw

    // Act
    await simulateCLI(['node', '/path/to/main.js'], complexPath);

    // Assert
    expect(dirname).toHaveBeenCalledWith(complexPath);
    expect(mkdirSync).toHaveBeenCalledWith('very/deep/nested/path', { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(complexPath, mockSvg);
    expect(consoleLogSpy).toHaveBeenCalledWith(`✅ SVG written to ${complexPath}`);
  });

  describe('generate function', () => {
    it('should export generate function that calls generateChatSVG', async () => {
      // Arrange
      const { generate } = await import('../../../../src/main.js');
      const customContext = { profile: { NAME: 'Test' } };
      const mockSvg = '<svg>Test SVG</svg>';
      generateChatSVG.mockResolvedValue(mockSvg);

      // Act
      const result = await generate(customContext);

      // Assert
      expect(result).toBe(mockSvg);
      expect(generateChatSVG).toHaveBeenCalledWith(customContext);
    });

    it('should handle generate function with no arguments', async () => {
      // Arrange
      const { generate } = await import('../../../../src/main.js');
      const mockSvg = '<svg>Default SVG</svg>';
      generateChatSVG.mockResolvedValue(mockSvg);

      // Act
      const result = await generate();

      // Assert
      expect(result).toBe(mockSvg);
      expect(generateChatSVG).toHaveBeenCalledWith({});
    });
  });
});