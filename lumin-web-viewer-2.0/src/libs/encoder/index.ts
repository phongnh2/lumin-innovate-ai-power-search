/* eslint-disable no-restricted-globals */
const enhancedAtob = (str: string) => decodeURIComponent(escape(atob(str)));

const enhancedBtoa = (str: string) => btoa(unescape(encodeURIComponent(str)));

export const encoder = {
  atob: enhancedAtob,
  btoa: enhancedBtoa,
};
