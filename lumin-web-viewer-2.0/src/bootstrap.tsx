import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import { KiwiContextMenuProvider, KiwiProvider, SnackbarProvider } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
/**
 * Error: cause Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
 * Polyfill to add Error.cause support to older browsers.
 */
import 'error-cause/auto';
import { StyleSheetManager } from 'styled-components';
/**
 * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31245
 */
// eslint-disable-next-line unused-imports/no-unused-imports
import * as types from 'styled-components/cssprop';
import 'helpers/i18n';
import 'animate.css';
import './index.scss';

import { setDayJsLocale } from 'helpers/setDayJsLocale';

import { queryClient } from 'utils/queryClient';

import { client } from './apollo';
import { MaterialThemes } from './constants/lumin-common';
import reportWebVitals from './helpers/reportWebVitals';
import RouterProvider from './navigation/RouterProvider';
import { store } from './redux/store';

const theme = createTheme(MaterialThemes);
setDayJsLocale();

const root = createRoot(document.getElementById('app'));

const renderApp = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <KiwiProvider>
      <KiwiContextMenuProvider>
        <SnackbarProvider />
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <I18nextProvider i18n={i18next}>
                <StyledEngineProvider injectFirst>
                  <StylesProvider injectFirst>
                    <StyleSheetManager disableVendorPrefixes>
                      <RouterProvider />
                    </StyleSheetManager>
                  </StylesProvider>
                </StyledEngineProvider>
              </I18nextProvider>
            </Provider>
          </ThemeProvider>
        </ApolloProvider>
      </KiwiContextMenuProvider>
    </KiwiProvider>
  </QueryClientProvider>
);

root.render(renderApp());

reportWebVitals();
