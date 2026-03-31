import React, { ComponentType } from 'react';
import { Navigate } from 'react-router';

import { useEnableWebReskin, useHomeMatch, useSignDocListMatch } from 'hooks';

import { Routers } from 'constants/Routers';

const withRedirectToMyDocumentOnNewPage =
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const { isEnableReskin } = useEnableWebReskin();
    const { isHomePage } = useHomeMatch();
    const { isInSignDocListPage } = useSignDocListMatch();
    const isNewPage = isHomePage || isInSignDocListPage;

    if (isNewPage && !isEnableReskin) {
      return <Navigate to={Routers.ROOT} replace />;
    }

    return <Component {...props} />;
  };

export default withRedirectToMyDocumentOnNewPage;
