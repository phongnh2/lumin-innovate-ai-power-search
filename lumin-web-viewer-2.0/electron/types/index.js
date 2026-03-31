/**
 * @fileoverview Type definitions for Lumin PDF Electron app
 * These JSDoc type definitions replace the TypeScript interfaces
 */

/**
 * OAuth Configuration Interface
 * @typedef {Object} OAuthConfig
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} redirectUri
 * @property {string[]} scopes
 */

/**
 * OAuth Tokens Interface
 * @typedef {Object} OAuthTokens
 * @property {string} access_token
 * @property {string} [refresh_token]
 * @property {number} [expires_in]
 * @property {string} [token_type]
 * @property {string} [scope]
 */

/**
 * Protocol URL Parser Result
 * @typedef {Object} ProtocolUrlData
 * @property {string} fullPath
 * @property {URLSearchParams} params
 */

/**
 * Google Token Data Interface
 * @typedef {Object} GoogleTokenData
 * @property {string} access_token
 * @property {string} scope
 * @property {string} email
 * @property {string} [userRemoteId]
 */

/**
 * Microsoft Token Data Interface
 * @typedef {Object} MicrosoftTokenData
 * @property {string} access_token
 * @property {string} cid
 * @property {string} scope
 * @property {string} [email]
 * @property {string} [oid]
 */

/**
 * Environment Configuration
 * @typedef {Object} EnvironmentConfig
 * @property {string} [BASEURL]
 * @property {string} [GOOGLE_PICKER_CLIENTID]
 * @property {string} [GOOGLE_PICKER_CLIENT_SECRET]
 * @property {string} [MICROSOFT_CLIENT_ID]
 */

/**
 * Environment Raw
 * @typedef {Object} EnvironmentRaw
 * @property {string} [BASEURL]
 * @property {string} [GOOGLE_PICKER_CLIENTID]
 * @property {string} [GOOGLE_PICKER_CLIENT_SECRET]
 * @property {string} [LUMIN_BASEURL]
 * @property {string} [LUMIN_GOOGLE_PICKER_CLIENTID]
 * @property {string} [LUMIN_MICROSOFT_CLIENT_ID]
 */

/**
 * File Operation Result
 * @typedef {Object} FileOperationResult
 * @property {boolean} success
 * @property {string} [error]
 */

/**
 * Window State
 * @typedef {Object} WindowState
 * @property {boolean} isMaximized
 * @property {boolean} isMinimized
 * @property {boolean} isVisible
 */

/**
 * Custom Message Box Options
 * @typedef {Object} CustomMessageBoxOptions
 * @property {string} title
 * @property {string} message
 * @property {string} type
 * @property {string[]} buttons
 * @property {string} [detail]
 */

/**
 * Menu Template
 * @typedef {import('electron').MenuItemConstructorOptions[]} MenuTemplate
 */

/**
 * Electron Module Error
 */
export class ElectronModuleError extends Error {
  /**
   * @param {string} message
   * @param {string} module
   */
  constructor(message, module) {
    super(message);
    this.name = 'ElectronModuleError';
    this.module = module;
  }
}
