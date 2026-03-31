import type { GrecaptchaInstance, WindowWithGrecaptcha } from './GoogleReCaptchaV3.interface';
import { ERROR_MESSAGES, RECAPTCHA_ENTERPRISE_SCRIPT_URL, RECAPTCHA_SCRIPT_ID } from './GoogleReCaptchaV3.interface';

export const isScriptInjected = (): boolean => !!document.getElementById(RECAPTCHA_SCRIPT_ID);

export const injectRecaptchaScript = (siteKey: string): Promise<void> =>
  new Promise((resolve, reject) => {
    // Check if script already exists
    if (isScriptInjected()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `${RECAPTCHA_ENTERPRISE_SCRIPT_URL}?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(ERROR_MESSAGES.SCRIPT_LOAD_FAILED));

    document.head.appendChild(script);
  });

export const getGrecaptchaFromWindow = (): GrecaptchaInstance | undefined => {
  const windowObj = window as WindowWithGrecaptcha;
  return windowObj.grecaptcha?.enterprise || windowObj.grecaptcha;
};

export const isGrecaptchaReady = (instance: GrecaptchaInstance | undefined): instance is GrecaptchaInstance =>
  !!instance?.execute;

export const executeRecaptcha = (siteKey: string, action: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const grecaptcha = getGrecaptchaFromWindow();

    if (!isGrecaptchaReady(grecaptcha)) {
      reject(new Error(ERROR_MESSAGES.RECAPTCHA_NOT_LOADED));
      return;
    }

    // Wrap in ready() to ensure internal state is fully initialized
    // This is critical for handling remounts correctly
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
