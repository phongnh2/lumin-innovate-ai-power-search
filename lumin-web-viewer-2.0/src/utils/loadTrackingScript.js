/* eslint-disable */
window.gtag = function() {
}

export const insertGA4 = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  console.info('🎉 GA4 script has been loaded.')
};
