import { newTemplate } from './utils';

export const EmailVerification = newTemplate<{ verificationUrl: string }>('email-verification.hbs', { title: 'Confirm Your Email Address' });
