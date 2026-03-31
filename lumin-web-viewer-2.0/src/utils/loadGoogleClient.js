const SCRIPT_URL = 'https://apis.google.com/js/api.js';
const SCRIPT_ID = 'google-client-script';

export const loadGoogleClient = () => new Promise((resolve, reject) => {
  const currentScript = document.getElementById(SCRIPT_ID);
  if (currentScript) {
    console.info('Google client has been already loaded.');
    resolve();
  }
  const script = document.createElement('script');
  script.src = SCRIPT_URL;
  script.id = SCRIPT_ID;
  script.onload = () => resolve();
  script.onerror = () => reject();
  document.body.appendChild(script);
});
