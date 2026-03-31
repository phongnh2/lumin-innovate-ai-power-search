import localStorageManager from 'helpers/localStorageManager';
import { getToolStyles } from '../getToolStyles';
import defaultToolStylesMap from 'constants/defaultToolStylesMap';

jest.mock('helpers/localStorageManager', () => ({
  disableLocalStorage: jest.fn(),
}));

jest.mock('constants/defaultToolStylesMap', () => ({
  testTool: { color: 'red', thickness: 2 },
}));

describe('getToolStyles', () => {
  const originalLocalStorage = global.localStorage;
  const mockGetItem = jest.fn();

  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: mockGetItem,
      },
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return styles from localStorage if they exist', () => {
    const mockStyles = JSON.stringify({ color: 'blue', thickness: 5 });
    mockGetItem.mockReturnValue(mockStyles);

    const result = getToolStyles('testTool' as any);
    expect(result).toBe(mockStyles);
  });

  it('should return default styles if localStorage is empty', () => {
    mockGetItem.mockReturnValue(null);

    const result = getToolStyles('testTool' as any);
    expect(result).toBe(JSON.stringify((defaultToolStylesMap as any)['testTool']));
  });

  it('should handle localStorage access errors gracefully', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockGetItem.mockImplementation(() => {
      throw new Error('Access denied');
    });

    const result = getToolStyles('testTool' as any);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Disabling "localStorage" because it could not be accessed.'
    );
    expect(localStorageManager.disableLocalStorage).toHaveBeenCalled();
    // Fallback to default
    expect(result).toBe(JSON.stringify((defaultToolStylesMap as any)['testTool']));
    
    consoleWarnSpy.mockRestore();
  });

  it('should return null if no styles in storage and no default map', () => {
    mockGetItem.mockReturnValue(null);
    const result = getToolStyles('nonExistentTool' as any);
    expect(result).toBeNull();
  });
});