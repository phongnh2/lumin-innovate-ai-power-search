import { AUTH_SERVICE_URL } from 'constants/urls';

const SIGN_IN = '/sign-in';
const LOGOUT = '/logout';

/**
 * @param {string=} returnTo
 */
export function signInKratos(returnTo) {
  clearLocalSession();
  toKratos(SIGN_IN, returnTo);
}

/**
 * @param {string=} returnTo
 */
export function signOutKratos(returnTo) {
  // default to login page
  let loginUrl = new URL(SIGN_IN, AUTH_SERVICE_URL).href;
  const loginQuery = new URLSearchParams({
    return_to: process.env.BASEURL,
  }).toString();

  loginUrl = `${loginUrl}?${loginQuery}`;
  clearLocalSession();
  toKratos(LOGOUT, returnTo || loginUrl);
}

/**
 * @param {string} route
 * @param {string=} returnTo
 */
function toKratos(route, returnTo) {
  const base = AUTH_SERVICE_URL;
  let query = new URLSearchParams({
    return_to: returnTo || window.location.href,
  }).toString();
  query = `?${query}`;

  window.location.href = new URL(route + query, base).href;
}

/**
 * Set kratos session to local storage
 * @param {import("@ory/kratos-client").Session} sess - Kratos session
 */
 export function setLocalSession() {
  // const item = JSON.stringify(sess);
  localStorage.setItem('isSigned', true);
}

/**
 * Get kratos session from local storage
 * @returns {import("@ory/kratos-client").Session=} Kratos session
 */
export function getLocalSession() {
  const item = localStorage.getItem('isSigned');
  if (!item) {
    return null;
  }
  return JSON.parse(item);
}

/**
 * @returns {boolean}
 */
export function existLocalSession() {
  const item = localStorage.getItem('isSigned');
  return !!item;
}

/**
 * Remove session from local storage
 */
export function clearLocalSession() {
  localStorage.removeItem('isSigned');
}
