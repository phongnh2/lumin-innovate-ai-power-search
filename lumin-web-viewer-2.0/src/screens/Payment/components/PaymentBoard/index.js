import React from 'react';

import GoogleReCaptchaV3Provider from 'luminComponents/GoogleReCaptchaV3Provider';

import PaymentBoard from './PaymentBoard';

const EnhancedPaymentBoard = (props) => (
  <GoogleReCaptchaV3Provider>
    <PaymentBoard {...props} />
  </GoogleReCaptchaV3Provider>
);

export default EnhancedPaymentBoard;
