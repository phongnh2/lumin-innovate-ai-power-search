/* eslint-disable class-methods-use-this */
export interface IRouterConfig {
  auth: boolean;
  guest?: boolean;
}

export enum Routes {
  ForgotPassword = '/forgot-password',
  SignIn = '/sign-in',
  SignUp = '/sign-up',
  SignUpInvitation = '/sign-up/invitation',
  Logout = '/logout',
  Settings = '/profile-settings',
  Root = '/',
  ResendVerification = '/sign-up/resend-verification-email',
  Gateway = '/authentication/gateway',
  Canny = '/authentication/canny',
  AccountVerification = '/sign-up/verification',
  VerifyAccount = '/verify-account',
  OpenDrive = '/open-drive',
  Notfound = '/404',
  Swagger = '/swagger/ui',
  XeroCallback = '/oauth/xero/callback',
  SignInSSO = '/sign-in-sso'
}

const configs: Record<Routes, IRouterConfig> = {
  // authentication
  // TODO: Add router /sign-up/verification, etc.
  [Routes.ForgotPassword]: {
    auth: false,
    guest: true
  },
  [Routes.SignIn]: {
    auth: false,
    guest: true
  },
  [Routes.SignUp]: {
    auth: false,
    guest: true
  },
  [Routes.SignUpInvitation]: {
    auth: false
  },
  [Routes.Logout]: {
    auth: false
  },
  // common
  [Routes.Root]: {
    auth: true
  },
  [Routes.Settings]: {
    auth: true
  },
  [Routes.ResendVerification]: {
    auth: false
  },
  [Routes.Gateway]: {
    auth: true
  },
  [Routes.Canny]: {
    auth: true
  },
  [Routes.AccountVerification]: {
    auth: false
  },
  [Routes.VerifyAccount]: {
    auth: false
  },
  [Routes.Notfound]: {
    auth: false
  },
  [Routes.OpenDrive]: {
    auth: false
  },
  [Routes.Swagger]: {
    auth: false
  },
  [Routes.XeroCallback]: {
    auth: false
  },
  [Routes.SignInSSO]: {
    auth: false,
    guest: true
  }
};

export class RouterConfig {
  get(path: string): IRouterConfig {
    const defaultValue: IRouterConfig = { auth: false, guest: false };
    return { ...defaultValue, ...configs[path as Routes] };
  }
}

const routerConfig = new RouterConfig();

export default routerConfig;
