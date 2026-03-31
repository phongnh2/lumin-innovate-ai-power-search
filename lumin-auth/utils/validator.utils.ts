import { DESKTOP_APP_PROTOCOL } from '@/features/desktop-app/constants/common';

function validateNameUrl(value: string) {
  const isContainUrlRegex = /(((https?|ftp):\/\/[a-zA-z0-9]+)|([a-zA-Z0-9]+\.[a-zA-Z]{2,})|([0-9]{1,3}\.){3}([0-9]{1,3})\b)/g;
  return !isContainUrlRegex.test(value);
}

function validateNameHtml(value: string) {
  const htmlRegex = /<([a-zA-Z1-6]+)>?.*?|<(.*) \/>/;
  return !htmlRegex.test(value);
}

function validateDangerousUriSchemes(value: string) {
  // Check for dangerous URI schemes that could be used for XSS or code injection
  // This regex matches schemes like javascript:, data:, vbscript:, file:, about:, etc.
  // Case-insensitive match for URI schemes at the start of the string
  const dangerousSchemeRegex = /^(javascript|data|vbscript|file|about|blob|ms-|chrome|chrome-extension):/i;
  return !dangerousSchemeRegex.test(value.trim());
}

function validateWhitelistUrl(url: string): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDesktopAppProtocol = url.startsWith(DESKTOP_APP_PROTOCOL);
  if (isDesktopAppProtocol) {
    return true;
  }
  const whitelistedUrl = isDevelopment
    ? new RegExp(/^(?:http?:\/\/)?(?:www\.)?(localhost|.+\.localhost)(?::\d+)?(?:\/|$|\?.*)/)
    : new RegExp(/^(?:https:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)?luminpdf\.com(?:\/|$|\?.*)/g);
  return whitelistedUrl.test(url);
}

export const validatorUtils = { validateNameUrl, validateNameHtml, validateWhitelistUrl, validateDangerousUriSchemes };

export default validatorUtils;
