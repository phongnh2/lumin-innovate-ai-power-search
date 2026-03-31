import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import 'helpers/i18n';
import './index.scss';
import { setDayJsLocale } from 'helpers/setDayJsLocale';

import { queryClient } from 'utils/queryClient';

import { client } from './apollo';
import { MaterialThemes } from './constants/lumin-common';
import { OfflineRouterProvider } from './navigation/RouterProvider';
import { store } from './redux/store';

const theme = createTheme(MaterialThemes);
setDayJsLocale();
const root = createRoot(document.getElementById('app'));
const renderApp = () => (
  <QueryClientProvider client={queryClient}>
    <ApolloProvider client={client}>
      <KiwiProvider>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <I18nextProvider i18n={i18next}>
              <StyledEngineProvider injectFirst>
                <StylesProvider injectFirst>
                  <OfflineRouterProvider />
                </StylesProvider>
              </StyledEngineProvider>
            </I18nextProvider>
          </Provider>
        </ThemeProvider>
      </KiwiProvider>
    </ApolloProvider>
  </QueryClientProvider>
);

root.render(renderApp());
