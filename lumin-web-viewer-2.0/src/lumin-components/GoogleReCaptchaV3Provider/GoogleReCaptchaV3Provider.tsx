import React from 'react';

import GoogleReCaptchaV3 from 'luminComponents/GoogleReCaptchaV3';

import { PUBLIC_RECAPTCHA_V3_SITE_KEY } from 'constants/urls';

const GoogleReCaptchaV3Provider = ({ children }: { children: React.ReactNode }) => (
  <GoogleReCaptchaV3 siteKey={PUBLIC_RECAPTCHA_V3_SITE_KEY}>{children}</GoogleReCaptchaV3>
);

export default GoogleReCaptchaV3Provider;
