export const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v3-script';

export const RECAPTCHA_ENTERPRISE_SCRIPT_URL = 'https://www.google.com/recaptcha/enterprise.js';

export const ERROR_MESSAGES = {
  CONTEXT_NOT_INITIALIZED: 'GoogleReCaptcha Context has not yet been initialized',
  RECAPTCHA_NOT_LOADED: 'Google ReCaptcha has not been loaded',
  RECAPTCHA_NOT_AVAILABLE: 'grecaptcha not available after script load',
  SCRIPT_LOAD_FAILED: 'Failed to load reCAPTCHA script',
  INITIALIZATION_FAILED: 'Failed to initialize reCAPTCHA',
} as const;

export interface GrecaptchaInstance {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  reset?: (widgetId?: number) => void;
  getResponse?: (widgetId?: number) => string;
  render?: (container: string | HTMLElement, parameters: object) => number;
}

export interface GoogleReCaptchaContextValue {
  instance: GrecaptchaInstance | undefined;
  siteKey: string;
  isLoading: boolean;
  executeV3: (action: string) => Promise<string>;
}

export interface GoogleReCaptchaV3ProviderProps {
  children: React.ReactNode;
  siteKey: string;
}

export interface WindowWithGrecaptcha extends Window {
  grecaptcha?: {
    enterprise?: GrecaptchaInstance;
  } & GrecaptchaInstance;
}
