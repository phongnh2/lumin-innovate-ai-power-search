/* eslint-disable class-methods-use-this */
import {
  Configuration,
  Session,
  FrontendApi,
  LoginFlow,
  FrontendApiCreateBrowserLoginFlowRequest,
  FrontendApiUpdateLoginFlowRequest,
} from '@ory/kratos-client';

import Axios from '@libs/axios';

import logger from 'helpers/logger';

import { getFullPathWithPresetLang } from 'utils/getLanguage';
import LocalStorageUtils from 'utils/localStorage';
import { queryClient } from 'utils/queryClient';
import { redirectFlowUtils } from 'utils/redirectFlow';
import SessionUtils from 'utils/session';

import { AUTH_SERVICE_URL, KRATOS_PUBLIC_API } from 'constants/urls';
import { FORWARDED_FLP_URL_PARAMS } from 'constants/UrlSearchParam';

export enum KratosRoutes {
  SIGN_IN = '/sign-in',
  SIGN_UP = '/sign-up',
  SIGN_UP_INVITATION = '/sign-up/invitation',
  LOGOUT = '/logout',
  PROFILE_SETTINGS = '/profile-settings',
  SAML_SSO_SIGN_IN = '/sign-in-sso',
}

export enum ProfileSettingSections {
  GOOGLE_SIGN_IN = 'google-sign-in',
  MICROSOFT_SIGN_IN = 'microsoft-sign-in',
}

type TToKratosOptions = {
  preserveQuery?: boolean;
};

type TSearchParamsOptions = {
  highlight?: string;
  loginHint?: string;
};

export type TReturnTo = boolean | { url: string };

class KratosService {
  private _kratosClient: FrontendApi;

  private static _instance: KratosService;

  private constructor() {
    this._kratosClient = new FrontendApi(
      new Configuration({
        basePath: KRATOS_PUBLIC_API,
        baseOptions: {
          withCredentials: true,
        },
      })
    );
  }

  public static instance(): KratosService {
    if (!this._instance) {
      this._instance = new KratosService();
    }
    return this._instance;
  }

  public toKratos(
    route: KratosRoutes,
    returnTo?: TReturnTo,
    options: TToKratosOptions = { preserveQuery: false },
    searchParamsOptions: TSearchParamsOptions = { highlight: '', loginHint: '' }
  ): void {
    const base = AUTH_SERVICE_URL;
    const returnToKey = 'return_to';
    const currentQuery = new URLSearchParams(window.location.search);
    const currentQueryObject = Array.from(currentQuery.entries()).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }),
      {} as Record<string, string>
    );

    const paramsToAdd = Object.entries(searchParamsOptions)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .reduce((params, [key, value]) => ({ ...params, [key]: value }), {});

    const q = new URLSearchParams({
      ...(options.preserveQuery && currentQueryObject),
      ...paramsToAdd,
    });

    if (!returnTo) {
      Array.from(currentQuery.entries()).forEach(([key, value]) => {
        if (FORWARDED_FLP_URL_PARAMS.includes(key)) {
          q.append(key, value);
        }
      });
    }

    if (typeof returnTo === 'boolean' && returnTo) {
      q.append(returnToKey, window.location.href);
    }

    if (typeof returnTo === 'object') {
      q.append(returnToKey, returnTo.url);
    }

    const qString = q.toString();

    const pathname = [route, qString].filter(Boolean).join('?');
    const pathnameWithPresetLang = getFullPathWithPresetLang(pathname);
    window.location.href = new URL(pathnameWithPresetLang, base).href;
  }

  signIn(returnTo?: TReturnTo, options?: TToKratosOptions, searchParamsOptions?: TSearchParamsOptions): void {
    return this.toKratos(KratosRoutes.SIGN_IN, returnTo, options, searchParamsOptions);
  }

  signUp(returnTo?: TReturnTo): void {
    return this.toKratos(KratosRoutes.SIGN_UP, returnTo);
  }

  signUpInvitation(): void {
    return this.toKratos(KratosRoutes.SIGN_UP_INVITATION, false, { preserveQuery: true });
  }

  profileSettings(returnTo?: TReturnTo, highlight?: string): void {
    return this.toKratos(KratosRoutes.PROFILE_SETTINGS, returnTo, {}, { highlight });
  }

  samlSsoSignIn(returnTo?: TReturnTo, loginHint?: string): void {
    return this.toKratos(KratosRoutes.SAML_SSO_SIGN_IN, returnTo, {}, { loginHint });
  }

  clearLoggedInSessionData() {
    LocalStorageUtils.clear();
    redirectFlowUtils.deleteCookies();
    queryClient.clear();
  }

  async signOut(callback: () => Promise<void> | void = () => {}): Promise<void> {
    const token = await SessionUtils.getAuthorizedToken({ forceNew: true });
    if (!token) {
      this.clearLoggedInSessionData();
      window.location.reload();
      return;
    }
    const {
      data: { logout_token },
    } = await this._kratosClient.createBrowserLogoutFlow();
    await this._kratosClient.updateLogoutFlow({ token: logout_token });
    await Axios.axiosLuminAuth.post(`${AUTH_SERVICE_URL}/api/auth/sign-out`);
    await callback();
    this.clearLoggedInSessionData();
    return this.toKratos(KratosRoutes.LOGOUT, false);
  }

  async toSession(): Promise<Session & { tokenized: string }> {
    try {
      const resp = await Axios.axios.get(`${KRATOS_PUBLIC_API}/sessions/whoami`, {
        params: {
          tokenize_as: 'lumin_authorization_jwt',
        },
        withCredentials: true,
      });
      return resp.data as Session & { tokenized: string };
    } catch (error) {
      logger.logError({
        reason: 'ToSessionError:kratos',
        error: error as Error,
      });
      throw error;
    }
  }

  async createBrowserLoginFlow(params?: FrontendApiCreateBrowserLoginFlowRequest): Promise<LoginFlow> {
    try {
      const { data: flow } = await this._kratosClient.createBrowserLoginFlow(params);
      return flow;
    } catch (error) {
      logger.logError({
        reason: 'CreateBrowserLoginFlowError:kratos',
        error: error as Error,
      });
      throw error;
    }
  }

  async updateLoginFlow(params: FrontendApiUpdateLoginFlowRequest): Promise<void> {
    try {
      await this._kratosClient.updateLoginFlow(params);
    } catch (error) {
      logger.logError({
        reason: 'UpdateLoginFlowError:kratos',
        error: error as Error,
      });
      throw error;
    }
  }
}

export const kratosService = KratosService.instance();
