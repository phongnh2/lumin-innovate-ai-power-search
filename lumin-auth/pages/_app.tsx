import { KiwiProvider } from '@kiwi-ui';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
import NextNProgress from 'nextjs-progressbar';
import { ReactElement, ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';

import AppProvider from '@/components/AppProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { useFetchUserLocation, useGetCanonicalUrl, useHandleBeforeUnload, useLogVersion, useSetupAutoTracking, useTrackingButtonEvent } from '@/hooks';
import { createStore } from '@/lib/store';
import { Colors, SnackbarProvider } from '@/ui';

import nextI18NextConfig from '../next-i18next.config.js';
import '../styles/kiwi.scss';
// eslint-disable-next-line import/order
import '../styles/globals.css';

dayjs.extend(localizedFormat);

const FAVICON_VERSION = 2;

type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, pageProps?: Record<string, unknown>) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? (page => page);
  const store = useMemo(
    () =>
      createStore({
        account: {
          identity: pageProps.identity
        },
        currentUser: pageProps.currentUser
      }),
    [pageProps.currentUser, pageProps.identity]
  );

  useSetupAutoTracking();
  useLogVersion();

  useTrackingButtonEvent();
  useHandleBeforeUnload();
  useFetchUserLocation();

  const canonicalUrl = useGetCanonicalUrl();

  return (
    <>
      <Head>
        {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}
        <link rel='shortcut icon' href={`/assets/favicon/favicon.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='57x57' href={`/assets/favicon/apple-icon-57x57.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='60x60' href={`/assets/favicon/apple-icon-60x60.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='72x72' href={`/assets/favicon/apple-icon-72x72.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='76x76' href={`/assets/favicon/apple-icon-76x76.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='114x114' href={`/assets/favicon/apple-icon-114x114.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='120x120' href={`/assets/favicon/apple-icon-120x120.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='144x144' href={`/assets/favicon/apple-icon-144x144.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='152x152' href={`/assets/favicon/apple-icon-152x152.png?v=${FAVICON_VERSION}`} />
        <link rel='apple-touch-icon' sizes='180x180' href={`/assets/favicon/apple-icon-180x180.png?v=${FAVICON_VERSION}`} />
        <link rel='icon' type='image/png' sizes='192x192' href={`/assets/favicon/android-icon-192x192.png?v=${FAVICON_VERSION}`} />
        <link rel='icon' type='image/png' sizes='32x32' href={`/assets/favicon/favicon-32x32.png?v=${FAVICON_VERSION}`} />
        <link rel='icon' type='image/png' sizes='96x96' href={`/assets/favicon/favicon-96x96.png?v=${FAVICON_VERSION}`} />
        <link rel='icon' type='image/png' sizes='16x16' href={`/assets/favicon/favicon-16x16.png?v=${FAVICON_VERSION}`} />
        <link rel='icon' href={`/assets/favicon/favicon.png?v=${FAVICON_VERSION}`} />
        <link rel='mask-icon' href={`/assets/favicon/favicon-16x16.svg?v=${FAVICON_VERSION}`} />
        <link rel='icon' href={`/assets/favicon.ico?v=${FAVICON_VERSION}`} sizes='48x48' />
        <link rel='icon' href={`/assets/favicon/favicon.svg?v=${FAVICON_VERSION}`} sizes='any' type='image/svg+xml' />
        <meta name='viewport' content='initial-scale=1.0, maximum-scale=1.0' />
      </Head>
      <KiwiProvider>
        <ErrorBoundary>
          <>
            <NextNProgress color={Colors.SECONDARY_50} options={{ showSpinner: false }} />
            <Provider store={store}>
              <AppProvider>
                <GoogleAnalytics />
                <SnackbarProvider>{getLayout(<Component {...pageProps} />, pageProps)}</SnackbarProvider>
              </AppProvider>
            </Provider>
          </>
        </ErrorBoundary>
      </KiwiProvider>
    </>
  );
}

export default appWithTranslation(App, nextI18NextConfig);
