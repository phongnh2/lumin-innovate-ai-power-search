import { syncThirdPartyHandler } from '../syncThirdPartyService';

describe('syncThirdPartyService', () => {
  // Ensure we clean up the singleton state after each test
  afterEach(() => {
    syncThirdPartyHandler.destroy();
  });

  it('should wait for callback to be set before syncing (Observer Pattern)', async () => {
    const mockCallback = jest.fn().mockResolvedValue(undefined);
    let syncPromiseResolved = false;

    // 1. Trigger sync without a callback registered
    const syncPromise = syncThirdPartyHandler.syncThirdParty();
    syncPromise.then(() => {
      syncPromiseResolved = true;
    });

    // 2. Verify promise is pending (awaiting event loop tick)
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(syncPromiseResolved).toBe(false);

    // 3. Register callback -> should trigger the pending promise
    syncThirdPartyHandler.setCallback(mockCallback);

    await syncPromise;
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should execute callback immediately if already set', async () => {
    const mockCallback = jest.fn().mockResolvedValue(undefined);
    syncThirdPartyHandler.setCallback(mockCallback);

    await syncThirdPartyHandler.syncThirdParty();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should trigger on() listener when callback is set via notify()', (done) => {
    syncThirdPartyHandler.on(() => {
      done();
    });
    // Setting callback triggers notify()
    syncThirdPartyHandler.setCallback(jest.fn());
  });

  it('should trigger on() listener immediately if callback already exists', (done) => {
    syncThirdPartyHandler.setCallback(jest.fn());
    
    syncThirdPartyHandler.on(() => {
      done();
    });
  });

  it('should pass the AbortSignal to the callback', async () => {
    const mockCallback = jest.fn().mockResolvedValue(undefined);
    syncThirdPartyHandler.setCallback(mockCallback);
    
    const abortController = new AbortController();
    await syncThirdPartyHandler.syncThirdParty({ signal: abortController.signal });
    
    expect(mockCallback).toHaveBeenCalledWith({ signal: abortController.signal });
  });

  it('should destroy the callback reference', async () => {
    const mockCallback = jest.fn();
    syncThirdPartyHandler.setCallback(mockCallback);
    
    syncThirdPartyHandler.destroy();
    
    // After destroy, syncThirdParty should wait again (promise pending)
    let syncPromiseResolved = false;
    const syncPromise = syncThirdPartyHandler.syncThirdParty();
    syncPromise.then(() => { syncPromiseResolved = true; });
    
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(syncPromiseResolved).toBe(false);
    
    // Clean up to resolve the pending promise
    syncThirdPartyHandler.setCallback(jest.fn());
    await syncPromise;
  });
});