type Callback = () => unknown | Promise<unknown>;

class AuthenticationObserver {
  private isAuthenticated = false;

  private onAuthenticated: Callback = null;

  notify() {
    this.isAuthenticated = true;
    this.onAuthenticated?.();
  }

  on(cb: Callback): this {
    this.onAuthenticated = cb;
    if (this.isAuthenticated) {
      this.notify();
    }
    return this;
  }

  wait(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isAuthenticated) {
        resolve();
      } else {
        this.on(resolve);
      }
    });
  }
}

export default new AuthenticationObserver();