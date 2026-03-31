export const FormName = {
  SIGN_IN_FORM: 'signInForm',
  SIGN_UP_FORM: 'signUpForm',
  SIGN_UP_WITH_LINK: 'signUpWithLink',
  FORGOT_PASSWORD: 'forgotPassword',
  RESET_PASSWORD: 'resetPassword',
  SIGN_IN_SSO: 'signInSSO'
};

export const FormPurpose = {
  [FormName.SIGN_IN_FORM]: 'Email and password sign in',
  [FormName.SIGN_UP_FORM]: 'Email and password sign up',
  [FormName.SIGN_UP_WITH_LINK]: 'Sign-up with invitation form',
  [FormName.FORGOT_PASSWORD]: 'Forgot password form',
  [FormName.RESET_PASSWORD]: 'Reset password form'
};
