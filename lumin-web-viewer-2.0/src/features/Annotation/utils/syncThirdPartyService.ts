// This is a singleton service that provides access to the handleSyncThirdParty function
// outside of React components using the observer pattern
class SyncThirdPartyHandler {

  private syncThirdPartyCallback: ({ signal }?: { signal?: AbortSignal }) => Promise<void> | null = null;

  private callbackReadyResolver: (() => void) | null = null;

  setCallback(callback: ({ signal }?: { signal?: AbortSignal }) => Promise<void>) {
    this.syncThirdPartyCallback = callback;
    this.notify();
  }

  destroy() {
    this.syncThirdPartyCallback = null;
  }

  notify() {
    this.callbackReadyResolver?.();
    this.callbackReadyResolver = null;
  }

  on(cb: () => void) {
    this.callbackReadyResolver = cb;
    if (this.syncThirdPartyCallback) {
      this.notify();
    }
  }

  wait(): Promise<void> {
    return new Promise((resolve) => {
      if (this.syncThirdPartyCallback) {
        resolve();
      } else {
        this.on(resolve);
      }
    });
  }

  async syncThirdParty({ signal }: { signal?: AbortSignal } = {}): Promise<void> {
    if (!this.syncThirdPartyCallback) {
      await this.wait();
    }

    return this.syncThirdPartyCallback({ signal });
  }
}

const syncThirdPartyHandler = new SyncThirdPartyHandler();

export { syncThirdPartyHandler };