import React from 'react';

import GoogleReCaptchaV3Provider from 'luminComponents/GoogleReCaptchaV3Provider';

import CardForm, { CardFormProps } from './CardForm';

const CardFormWrapper = (props: Omit<CardFormProps, 'stripeAccountId' | 'getNewSecret'>) => (
  <GoogleReCaptchaV3Provider>
    <CardForm {...props} />
  </GoogleReCaptchaV3Provider>
);

export default CardFormWrapper;
