const { getNamespaceEnv } = require('./combineEnv');

const preprodEnv = getNamespaceEnv('preprod');

class EnvManager {
  // eslint-disable-next-line class-methods-use-this
  getTestingEnv(key) {
    const replaceKey = `LUMIN_${key}`;
    return process.env[replaceKey];
  }

  // eslint-disable-next-line class-methods-use-this
  getEnv(key) {
    if (process.env.NODE_ENV === 'test') {
      return this.getTestingEnv(key);
    }

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (window.location.hostname) {
      case 'app-testing.luminpdf.com': {
        const replaceKey = `LUMIN_${key}`;
        return preprodEnv[replaceKey] || process.env[key];
      }
      default:
        return process.env[key];
    }
  }
}

export default new EnvManager();
export { EnvManager };
