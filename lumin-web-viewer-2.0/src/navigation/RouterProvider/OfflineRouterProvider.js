import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Navigate,
  RouterProvider as ReactRouterProvider,
  Route,
  createRoutesFromElements,
  useLocation,
} from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import selectors from 'selectors';

import AppLayout from 'layouts/AppLayout';
import OfflineRouter from 'navigation/OfflineRouter';
import RouterConfig from 'navigation/OfflineRouter/RouterConfig';

import LoadingComponent from 'lumin-components/AppCircularLoading';

import withLayoutProps from 'HOC/withLayoutProps';
import withRouter from 'HOC/withRouter';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { LANGUAGES } from 'constants/language';
import { ROUTE_MATCH } from 'constants/Routers';

import EditorRoute from './components/EditorRoute';

const NotFoundLoadableComponent = lazyWithRetry(() => import('../../screens/NotFound'), {
  fallback: <LoadingComponent />,
});

const OfflineAppLayout = withRouter(withLayoutProps(AppLayout));

const EditorNavigate = () => {
  const location = useLocation();
  return <Navigate to={location.pathname.replace('/offline', '')} />;
};

const RouterProvider = () => {
  const language = useSelector(selectors.getLanguage);
  const basename = language !== LANGUAGES.EN ? language : '';

  const getRouteComponent = (route) => {
    if (route.auth) {
      return (
        <OfflineAppLayout header={route.header} sidebar={route.sidebar} fullWidth={route.fullWidth}>
          <route.component pageTitle={route.pageTitle} />
        </OfflineAppLayout>
      );
    }
    if ([ROUTE_MATCH.VIEWER, ROUTE_MATCH.GUEST_VIEW].includes(route.path)) {
      return <EditorRoute route={route} />;
    }
    return <route.component pageTitle={route.pageTitle} />;
  };

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route element={<OfflineRouter />}>
            {RouterConfig.map((route, i) => (
              <Route path={route.path} element={getRouteComponent(route)} key={i} />
            ))}
            <Route path="/offline/viewer/*" element={<EditorNavigate />} />
            <Route path="/offline/*" element={<Navigate to="/documents" />} />
            <Route path="*" element={<NotFoundLoadableComponent />} />
          </Route>
        ),
        {
          basename,
        }
      ),
    [basename]
  );
  return <ReactRouterProvider router={router} />;
};

export default RouterProvider;
