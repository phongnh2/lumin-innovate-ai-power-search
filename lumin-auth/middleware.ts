import axios, { AxiosError } from 'axios';
import { isbot } from 'isbot';
import { NextRequest, NextResponse } from 'next/server';
import 'regenerator-runtime/runtime.js';

import routerConfig, { IRouterConfig, Routes } from '@/configs/routers';
import ValidatorUtils from '@/utils/validator.utils';

import { environment } from './configs/environment';
import { LoggerScope, QUERY_KEYS } from './constants/common';
import { CookieStorageKey } from './constants/cookieKey';
import { LUMIN_SESSION } from './constants/sessionKey';
import { CANNY_AUTH_REGEX } from './constants/url';
import { logger } from './lib/logger';
import { EdgeFrontendApiRepository } from './lib/ory/repositories/edge-api';
import { i18n } from './next-i18next.config.js';
import { getLanguageFromUrl } from './utils/getLanguage';
import { isSignInFlowUrl } from './utils/signInFlow.utils';

const PUBLIC_FILE = /\.(.*)$/;

const getLanguage = (request: NextRequest): string => {
  const { defaultLocale, locales } = i18n;
  const languageFromBrowser = request.headers.get('accept-language')?.slice(0, 2);
  const languageFromCookie = request.cookies.get(CookieStorageKey.LANGUAGE)?.value;
  const language = languageFromCookie || languageFromBrowser || defaultLocale;
  const isSupportedLanguage = locales.includes(language as string);
  return isSupportedLanguage ? language : defaultLocale;
};

const getRedirectUrl = (path: Routes, req: NextRequest) => {
  const language = getLanguage(req);
  const subDirectory = language === i18n.defaultLocale ? '' : `/${language}`;
  return new URL(`${subDirectory}${path}`, req.url);
};

const isDevelopment = process.env.NODE_ENV === 'development';

const isOptionMethod = (request: NextRequest): boolean => request.method === 'OPTIONS';

const axiosServer = axios.create();

const edgeFrontendApi = new EdgeFrontendApiRepository(axiosServer);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const next = async (request: NextRequest, init?: any) => {
  if (request.nextUrl.pathname.includes('/api/') || request.nextUrl.pathname.match(PUBLIC_FILE)) {
    return NextResponse.next(init);
  }
  if (!Object.values(Routes).includes(request.nextUrl.pathname as Routes) && !request.nextUrl.pathname.includes('/oauth2/')) {
    return NextResponse.redirect(new URL(Routes.Notfound, request.url), { status: 308 });
  }
  const { defaultLocale } = i18n;
  const languageFromUrl = getLanguageFromUrl(request.url);
  const language = getLanguage(request);
  if (language !== languageFromUrl && language !== defaultLocale) {
    const originAndLanguageSubPath = languageFromUrl ? `${request.nextUrl.origin}/${languageFromUrl}` : request.nextUrl.origin;
    const urlWithCorrectLanguage = new URL(`/${language}${request.nextUrl.href.replace(originAndLanguageSubPath, '')}`, request.url);
    return NextResponse.redirect(urlWithCorrectLanguage);
  }
  return NextResponse.next(init);
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function middleware(request: NextRequest) {
  const config = routerConfig.get(request.nextUrl.pathname);
  const authCheckingRequired = isAuthCheckingRequired(config);

  // Cors handler for localhost only
  if (needRewriteUrl(request)) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/proxy';
    return NextResponse.rewrite(url);
  }

  // Allow bots/crawlers to bypass authentication to read og:tags and other metadata
  if (isbot(request.headers.get('user-agent') || '')) {
    logger.info({
      message: 'Middleware detected bot/crawler',
      meta: { pathname: request.nextUrl.pathname, userAgent: request.headers.get('user-agent') }
    });
    // return next(request);
  }

  if (!authCheckingRequired) {
    return next(request);
  }
  const setCookies = [
    `${LUMIN_SESSION.AUTHENTICATION}=''; Path=/; Domain=${
      isDevelopment ? 'localhost' : '.luminpdf.com'
    }; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Lax`,
    `ory_hydra_session_dev=empty; Path=/; Domain=${isDevelopment ? 'localhost' : '.luminpdf.com'}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Lax`
  ];
  const sessionName = environment.public.common.orySessionName;
  const orySession = request.cookies.get(sessionName);
  if (!orySession) {
    let response: NextResponse;
    if (config.auth) {
      response = NextResponse.redirect(getRedirectUrl(Routes.SignIn, request));
    } else {
      response = await next(request);
      setClearSiteDataHeader(response);
    }
    const cookiesString = setCookies.join(',');
    response.headers.set('Set-Cookie', cookiesString);
    return response;
  }
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const data = await edgeFrontendApi.toSession({
      cookie: cookieHeader
    });
    if (data.status === 200 && config.guest) {
      if (CANNY_AUTH_REGEX.test(request.url)) {
        const redirectUrl = request.nextUrl.searchParams.get(QUERY_KEYS.REDIRECT) || '';
        const cannyUrl = getRedirectUrl(Routes.Canny, request);
        cannyUrl.searchParams.set(QUERY_KEYS.REDIRECT, encodeURIComponent(redirectUrl));
        return NextResponse.redirect(cannyUrl);
      }
      if (isSignInFlowUrl(request.url)) {
        const redirectUrl = request.nextUrl.searchParams.get(QUERY_KEYS.REDIRECT) || '';
        if (redirectUrl && ValidatorUtils.validateWhitelistUrl(redirectUrl)) {
          return NextResponse.redirect(redirectUrl);
        }
      }

      const returnTo = request.nextUrl.searchParams.get(QUERY_KEYS.RETURN_TO);
      if (!returnTo || !ValidatorUtils.validateWhitelistUrl(returnTo)) {
        return NextResponse.redirect(getRedirectUrl(Routes.Root, request));
      }
      return NextResponse.redirect(returnTo);
    }
    if (isRootPath(request)) {
      return NextResponse.redirect(getRedirectUrl(Routes.Settings, request));
    }
    return next(request, {
      request: {
        headers: request.headers
      }
    });
  } catch (e) {
    let isUnauthorized = false;
    let isForbidden = false;
    if (axios.isAxiosError(e)) {
      const error: AxiosError<{ error?: { code?: number } }> = e;
      isUnauthorized = error?.response?.data?.error?.code === 401;
      isForbidden = error?.response?.data?.error?.code === 403 || error?.response?.status === 403;

      if (isForbidden) {
        const errorData = error.response?.data as { error?: { code?: number; reason?: string; id?: string }; redirect_browser_to?: string };
        logger.error({
          err: error,
          message: 'ToSession failed with 403 In Middleware',
          meta: {
            errorCode: errorData?.error?.code,
            errorReason: errorData?.error?.reason,
            errorId: errorData?.error?.id,
            redirectBrowserTo: errorData?.redirect_browser_to
          },
          scope: LoggerScope.ERROR.ORY_EXCEPTION
        });
      }

      if (isUnauthorized && config.auth) {
        const response = NextResponse.redirect(getRedirectUrl(Routes.SignIn, request));
        const cookiesString = setCookies.join(',');
        response.headers.set('Set-Cookie', cookiesString);
        return setClearSiteDataHeader(response);
      }
    }
    if (!isUnauthorized && !isForbidden) {
      logger.error({ err: e as Error, meta: { url: request.url }, scope: LoggerScope.ERROR.UNKNOWN_ERROR });
    }
    const response = await next(request);
    return setClearSiteDataHeader(response);
  }
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico|assets|api/healthz).*)']
};

function isAuthCheckingRequired(configParam: IRouterConfig) {
  return configParam && (configParam.guest || configParam.auth);
}

function isRootPath(request: NextRequest) {
  return request.nextUrl.pathname === Routes.Root;
}

function needRewriteUrl(request: NextRequest) {
  return isDevelopment && isOptionMethod(request) && request.nextUrl.pathname.includes('/api');
}

function setClearSiteDataHeader(response: NextResponse): NextResponse {
  response.headers.set('Clear-Site-Data', '"storage"');
  return response;
}
