const { BrowserWindow } = require('electron');

class AuthWindowController {
  constructor(window) {
    this.setWindow(window);
  }

  setWindow(window) {
    if (window && !(window instanceof BrowserWindow)) {
      throw new TypeError('Expected BrowserWindow instance or null');
    }
    this.window = window;
  }

  close() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
      this.window = null;
    }
  }

  isActive() {
    return this.window !== null && !this.window.isDestroyed();
  }

  getWindow() {
    return this.window;
  }
}

module.exports = { AuthWindowController };
