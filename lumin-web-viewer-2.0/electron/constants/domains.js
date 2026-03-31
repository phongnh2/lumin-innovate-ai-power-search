/**
 * Domain whitelist constants for navigation control
 * These domains are allowed for navigation within the Electron app
 */

const { EnvironmentService } = require('../services/EnvironmentService');

/**
 * Get environment-specific domains from EnvironmentService
 * @returns {string[]}
 */
const getEnvironmentDomains = () => {
  try {
    const envService = EnvironmentService.getInstance();
    const config = envService.getConfig();
    const domains = [];

    if (config.BASEURL) {
      const baseUrl = new URL(config.BASEURL);
      domains.push(baseUrl.hostname);
    }

    if (config.AUTH_SERVICE_URL) {
      const authUrl = new URL(config.AUTH_SERVICE_URL);
      domains.push(authUrl.hostname);
    }

    return domains;
  } catch (error) {
    console.error('Failed to load environment domains:', error);
    return [];
  }
};

const STATIC_ALLOWED_DOMAINS = [
  'accounts.google.com',
  'apis.google.com',
  'www.googleapis.com',
  'oauth2.googleapis.com',
  'login.microsoftonline.com',
  'login.live.com',
  'account.live.com',
];

const getAllowedDomains = () => {
  const envDomains = getEnvironmentDomains();
  return [...STATIC_ALLOWED_DOMAINS, ...envDomains];
};

/**
 * Check if a hostname is in the allowed domains list
 * @param {string} hostname - The hostname to check
 * @returns {boolean} - True if the hostname is allowed
 */
const isAllowedDomain = (hostname) => {
  const allowedDomains = getAllowedDomains();
  return allowedDomains.some((domain) => {
    if (domain instanceof RegExp) {
      return domain.test(hostname);
    }
    return hostname === domain || hostname.startsWith(domain);
  });
};

module.exports = {
  STATIC_ALLOWED_DOMAINS,
  getAllowedDomains,
  isAllowedDomain,
};
