import { newTemplate } from './utils';

export const PasswordRecovery = newTemplate<{ recoveryUrl: string }>('password-recovery.hbs', { title: 'Reset your Password' });
