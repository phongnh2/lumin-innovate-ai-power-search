import popupWindowParams from '../utils/popupWindowParams';

describe('popupWindowParams', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Mock window properties
    Object.defineProperty(global, 'window', {
      value: {
        screen: {
          availWidth: 1920,
          availHeight: 1080,
        },
        innerWidth: 1600,
        innerHeight: 900,
        screenX: 100,
        screenY: 50,
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
    });
  });

  it('should return a string with window parameters', () => {
    const result = popupWindowParams(500, 600);
    expect(typeof result).toBe('string');
  });

  it('should include toolbar=0', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('toolbar=0');
  });

  it('should include menubar=0', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('menubar=0');
  });

  it('should include location=0', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('location=0');
  });

  it('should include status=0', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('status=0');
  });

  it('should include scrollbars=1', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('scrollbars=1');
  });

  it('should include resizable=0', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('resizable=0');
  });

  it('should include chrome=yes', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('chrome=yes');
  });

  it('should use preferred width when smaller than screen', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('width=500');
  });

  it('should use preferred height when smaller than screen', () => {
    const result = popupWindowParams(500, 600);
    expect(result).toContain('height=600');
  });

  it('should use screen width when preferred is larger', () => {
    const result = popupWindowParams(2000, 600);
    expect(result).toContain('width=1920');
  });

  it('should use screen height when preferred is larger', () => {
    const result = popupWindowParams(500, 2000);
    expect(result).toContain('height=1080');
  });

  it('should calculate left position correctly', () => {
    const result = popupWindowParams(500, 600);
    // left = Math.round((1600 - 500) / 2 + 100) = Math.round(550 + 100) = 650
    expect(result).toContain('left=650');
  });

  it('should calculate top position correctly', () => {
    const result = popupWindowParams(500, 600);
    // top = Math.round((900 - 600) / 3 + 50) = Math.round(100 + 50) = 150
    expect(result).toContain('top=150');
  });

  it('should return comma-separated parameters', () => {
    const result = popupWindowParams(500, 600);
    const parts = result.split(',');
    expect(parts.length).toBeGreaterThan(5);
  });

  it('should handle edge case when preferred equals screen size', () => {
    const result = popupWindowParams(1920, 1080);
    expect(result).toContain('width=1920');
    expect(result).toContain('height=1080');
  });
});

