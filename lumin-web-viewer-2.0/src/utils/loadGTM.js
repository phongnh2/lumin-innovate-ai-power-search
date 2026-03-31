import { TAG_MANAGER_ID } from 'constants/urls';

export default () => new Promise((resolve, reject) => {
  const script = 'script';
  const layer = 'dataLayer';
  window[layer] = window[layer] || [];
  window[layer].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const f = document.getElementsByTagName(script)[0];
  const j = document.createElement(script);
  const dl = layer !== 'dataLayer' ? `&l=${layer}` : '';
  j.async = true;
  j.src = `https://www.googletagmanager.com/gtm.js?id=${TAG_MANAGER_ID || 'GTM-N7QBWWK'}${dl}`;
  j.onload = resolve;
  j.onerror = reject;
  f.parentNode.insertBefore(j, f);
});
