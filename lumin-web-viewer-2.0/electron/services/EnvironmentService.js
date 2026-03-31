const fs = require('fs');
const path = require('path');

const { getNamespaceEnv } = require('../../settings/combineEnv');
const loadLuminEnvironment = require('../../settings/env');

class EnvironmentService {
  /**
   * @private
   * @type {EnvironmentService}
   */
  static instance;

  /**
   * @private
   */
  constructor() {
    /** @type {import('../types').EnvironmentConfig} */
    this.config = this.loadEnvironmentConfig();

    if (this.isDev) {
      console.log('🔧 Electron Environment Configuration:', {
        baseUrl: this.baseUrl,
        branch: this.branch,
        googlePickerClientId: this.googlePickerClientId,
        microsoftClientId: this.microsoftClientId,
        authServiceUrl: this.authServiceUrl,
      });
    }
  }

  /**
   * @returns {EnvironmentService}
   */
  static getInstance() {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  /**
   * @private
   * @returns {string}
   */
  getBranchFromConfig() {
    const isDev = process.env.NODE_ENV === 'development';

    // Development: don't read config file
    if (isDev) {
      return 'local';
    }

    // Production: read from bundled config file
    try {
      const configPath = path.join(__dirname, '../electron-config.json');

      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        return config.branch;
      }

      throw new Error('electron-config.json not found. Run build with --branch flag.');
    } catch (error) {
      console.error('Failed to load branch configuration:', error.message);
      throw error;
    }
  }

  /**
   * @private
   * @returns {import('../types').EnvironmentConfig}
   */
  loadEnvironmentConfig() {
    try {
      this.isDev = process.env.NODE_ENV === 'development';
      this.branch = this.getBranchFromConfig();

      console.log(`📦 Loading environment for branch: ${this.branch}`);

      /** @type {import('../types').EnvironmentRaw} */
      let envConfig;

      if (this.isDev) {
        // Development: use localhost config
        const { raw } = loadLuminEnvironment({});
        envConfig = {
          LUMIN_BASEURL: raw.BASEURL || 'http://localhost:3000',
          LUMIN_GOOGLE_PICKER_CLIENTID: raw.GOOGLE_PICKER_CLIENTID,
          LUMIN_MICROSOFT_CLIENT_ID: raw.MICROSOFT_CLIENT_ID,
          LUMIN_AUTH_SERVICE_URL: raw.AUTH_SERVICE_URL || 'http://localhost:3300',
        };
      } else {
        // Production: load branch-specific config
        envConfig = getNamespaceEnv(this.branch);
      }

      return {
        BASEURL: envConfig.LUMIN_BASEURL,
        GOOGLE_PICKER_CLIENTID: envConfig.LUMIN_GOOGLE_PICKER_CLIENTID,
        MICROSOFT_CLIENT_ID: envConfig.LUMIN_MICROSOFT_CLIENT_ID,
        AUTH_SERVICE_URL: envConfig.LUMIN_AUTH_SERVICE_URL,
      };
    } catch (error) {
      console.error('Failed to load environment config:', error);
      throw error;
    }
  }

  /**
   * @returns {string}
   */
  get baseUrl() {
    return this.config.BASEURL;
  }

  /**
   * @returns {string | undefined}
   */
  get googlePickerClientId() {
    return this.config.GOOGLE_PICKER_CLIENTID;
  }

  /**
   * @returns {string | undefined}
   */
  get microsoftClientId() {
    return this.config.MICROSOFT_CLIENT_ID;
  }

  /**
   * @returns {string | undefined}
   */
  get authServiceUrl() {
    return this.config.AUTH_SERVICE_URL;
  }

  /**
   * @returns {import('../types').EnvironmentConfig}
   */
  getConfig() {
    return { ...this.config };
  }
}

module.exports = { EnvironmentService };
