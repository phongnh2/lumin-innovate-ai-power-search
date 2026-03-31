import moduleFederationService, { loadRemote } from '../index';

// Mock the @module-federation/enhanced/runtime module
jest.mock('@module-federation/enhanced/runtime', () => ({
  createInstance: jest.fn().mockReturnValue({
    addRemote: jest.fn(),
    removeRemote: jest.fn(),
    registerShared: jest.fn(),
    get: jest.fn().mockImplementation((moduleSpecifier) => Promise.resolve({ default: `Mocked ${moduleSpecifier}` })),
    loadRemote: jest.fn().mockImplementation((moduleSpecifier) => 
      Promise.resolve({ default: `Mocked ${moduleSpecifier}` })
    ),
  }),
}));

describe('ModuleFederationService', () => {
  beforeEach(() => {
    // Reset the module between tests
    jest.clearAllMocks();
    // @ts-ignore - Reset the private properties for testing
    moduleFederationService.initialized = false;
    // @ts-ignore
    moduleFederationService.mfInstance = null;
  });

  it('should initialize with remotes', () => {
    const remotes = [
      {
        name: 'remote1',
        entry: 'http://localhost:2001/mf-manifest.json',
      },
    ];

    const instance = moduleFederationService.initialize('mf_host', remotes);
    expect(instance).toBeDefined();
    // @ts-ignore - Access private property for testing
    expect(moduleFederationService.initialized).toBe(true);
  });

  it('should get instance and initialize if not already initialized', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SIGN_MF_URL: 'http://sign-url',
      APP_MARKETPLACE_MF_URL: 'http://marketplace-url'
    };

    const instance = moduleFederationService.getInstance();
    expect(instance).toBeDefined();
    // @ts-ignore - Access private property for testing
    expect(moduleFederationService.initialized).toBe(true);

    // Restore env
    process.env = originalEnv;
  });

  it('should get instance with disabled MFs when environment variables are set', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      DISABLE_SIGN_MF: 'true',
      DISABLE_APP_MARKETPLACE_MF: 'true',
      SIGN_MF_URL: 'http://sign-url',
      APP_MARKETPLACE_MF_URL: 'http://marketplace-url'
    };

    const instance = moduleFederationService.getInstance();
    expect(instance).toBeDefined();
    // @ts-ignore - Access private property for testing
    expect(moduleFederationService.initialized).toBe(true);

    // Restore env
    process.env = originalEnv;
  });

  it('should load a remote module using loadRemote method', async () => {
    // Initialize first
    moduleFederationService.initialize('mf_host', []);

    const moduleSpecifier = 'remote1/MyComponent';
    const module = await moduleFederationService.loadRemote(moduleSpecifier);
    expect(module).toEqual({ default: `Mocked ${moduleSpecifier}` });
    // @ts-ignore
    expect(moduleFederationService.mfInstance.loadRemote).toHaveBeenCalledWith(moduleSpecifier);
  });

  it('should load a remote module using loadRemote helper function', async () => {
    // Initialize first
    moduleFederationService.initialize('mf_host', []);

    const moduleSpecifier = 'remote1/MyComponent';
    const module = await loadRemote(moduleSpecifier);
    expect(module).toEqual({ default: `Mocked ${moduleSpecifier}` });
    // @ts-ignore
    expect(moduleFederationService.mfInstance.loadRemote).toHaveBeenCalledWith(moduleSpecifier);
  });
  
  it('should handle loadRemote helper function', async () => {
    // Mock the loadRemote method directly
    const mockResult = { default: 'Mocked result' };
    jest.spyOn(moduleFederationService, 'loadRemote').mockResolvedValue(mockResult);

    const moduleSpecifier = 'remote1/MyComponent';
    const module = await loadRemote(moduleSpecifier);
    
    expect(module).toEqual(mockResult);
    expect(moduleFederationService.loadRemote).toHaveBeenCalledWith(moduleSpecifier);
  });

  it('should throw error when trying to use loadRemote before initialization', async () => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.restoreAllMocks();
    
    // Reset the module
    // @ts-ignore - Reset the private properties for testing
    moduleFederationService.initialized = false;
    // @ts-ignore
    moduleFederationService.mfInstance = null;
    
    // Mock getInstance to throw an error
    jest.spyOn(moduleFederationService, 'getInstance').mockImplementation(() => {
      throw new Error('Module Federation Service not initialized');
    });

    await expect(moduleFederationService.loadRemote('remote1/MyComponent'))
      .rejects
      .toThrow('Module Federation Service not initialized');
  });
});
