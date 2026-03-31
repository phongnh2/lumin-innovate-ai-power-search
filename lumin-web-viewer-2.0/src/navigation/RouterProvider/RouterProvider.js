import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouterProvider as ReactRouterProvider, createRoutesFromElements } from 'react-router';
import { createBrowserRouter, Route } from 'react-router-dom';

import selectors from 'selectors';

import Router from 'navigation/Router';
import Routes from 'navigation/RouterConfig';

import { getLanguageFromUrl } from 'utils/getLanguage';

import { LANGUAGES } from 'constants/language';
import { AuthRouteType, ROUTE_MATCH } from 'constants/Routers';

import { CommonRoute } from './components';
import EditorRoute from './components/EditorRoute';
import useWindowOpenerProtection from './hooks/useWindowOpenerProtection';
import AuthenRoute from '../AuthenRoute';

const RouterProvider = () => {
  const languageFromUrl = getLanguageFromUrl();
  const language = useSelector(selectors.getLanguage);
  const basename = language !== LANGUAGES.EN ? `/${language}` : '';

  useEffect(() => {
    if (language !== languageFromUrl && language !== LANGUAGES.EN) {
      if (languageFromUrl !== '') {
        window.location.href = `${window.location.origin}${window.location.pathname.replace(
          `/${languageFromUrl}`,
          basename
        )}${window.location.search}${window.location.hash}`;
      } else {
        window.location.href = `${window.location.origin}${basename}${window.location.pathname}${window.location.search}${window.location.hash}`;
      }
    }
  }, []);

  useWindowOpenerProtection();

  const renderRoute = (route) => {
    if (route.auth) {
      return (
        <Route
          key={1}
          path={route.path}
          element={
            <AuthenRoute
              key={1}
              type={route.organization ? AuthRouteType.ORGANIZATION : AuthRouteType.COMMON}
              component={route.component}
              exact={route.exact}
              path={route.path}
              pageTitle={route.pageTitle}
              condition={route.condition}
              header={route?.header}
              sidebar={route?.sidebar}
              title={route?.title}
              fullWidth={route?.fullWidth}
              applyReskin={route?.applyReskin}
            />
          }
        />
      );
    }

    return (
      <Route
        key={1}
        path={route.path}
        element={
          [
            ROUTE_MATCH.VIEWER,
            ROUTE_MATCH.VIEWER_TEMP_EDIT_EXTERNAL_PDF,
            ROUTE_MATCH.VIEWER_TEMP_EDIT,
            ROUTE_MATCH.GUEST_VIEW,
            ROUTE_MATCH.TEMPLATE_VIEWER,
          ].includes(route.path) ? (
            <EditorRoute route={route} />
          ) : (
            <CommonRoute route={route} />
          )
        }
      />
    );
  };

  const router = useMemo(
    () =>
      createBrowserRouter(createRoutesFromElements(<Route element={<Router />}>{Routes.map(renderRoute)}</Route>), {
        basename,
      }),
    [basename]
  );
  return <ReactRouterProvider router={router} />;
};

export default RouterProvider;
