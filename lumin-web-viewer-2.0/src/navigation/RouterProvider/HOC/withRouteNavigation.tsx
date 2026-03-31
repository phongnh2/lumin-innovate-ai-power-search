import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { shallowEqual, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

import selectors from 'selectors';

import { usePrevious, useTranslation } from 'hooks';

import { getLanguage, getLanguageFromUrl, getUrlWithoutLanguage } from 'utils/getLanguage';

import { LANGUAGES } from 'constants/language';
import { Routers as RoutersConstant } from 'constants/Routers';

import { IUser } from 'interfaces/user/user.interface';

interface IRouteProps {
  pageTitle: string;
  noIndex: boolean;
}

interface IRouteNavigationProps {
  route: IRouteProps;
}

function withRouteNavigation<T extends IRouteNavigationProps>(
  Component: React.ComponentType<T>
): (props: T) => JSX.Element {
  function WithRouteNavigation(props: T): JSX.Element {
    const location = useLocation();
    const { t } = useTranslation();
    const language = getLanguage() as LANGUAGES;
    const languageFromUrl = getLanguageFromUrl();
    const url = getUrlWithoutLanguage();
    const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
    const prevCurrentUser = usePrevious(currentUser);

    const { route } = props;

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);

    if (
      (language !== languageFromUrl && Boolean(languageFromUrl)) ||
      (language === LANGUAGES.EN && languageFromUrl === LANGUAGES.EN)
    ) {
      return <Navigate to={url} />;
    }

    /**
     * user logged out
     */
    if (prevCurrentUser && !currentUser) {
      return (
        <Navigate
          to={{
            pathname: RoutersConstant.SIGNIN,
            search: location.search,
          }}
        />
      );
    }

    return (
      <>
        <Helmet>
          {route?.pageTitle && <title>{t(route?.pageTitle)}</title>}
          {route?.noIndex && <meta name="robots" content="noindex, nofollow" />}
        </Helmet>
        <Component pageTitle={route?.pageTitle} location={location} {...props} />
      </>
    );
  }

  return WithRouteNavigation;
}

export default withRouteNavigation;
