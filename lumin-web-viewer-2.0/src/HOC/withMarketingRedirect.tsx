import React, { ComponentType } from 'react';
import { Navigate } from 'react-router';

import AppCircularLoading from 'luminComponents/AppCircularLoading';

import useTransformMarketingUrl from 'hooks/useTransformMarketingUrl';

const withMarketingRedirect =
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const { url, isLoading } = useTransformMarketingUrl();
    if (isLoading) {
      return <AppCircularLoading />;
    }
    if (url) {
      return <Navigate to={url} replace />;
    }
    return <Component {...props} />;
  };

export default withMarketingRedirect;
