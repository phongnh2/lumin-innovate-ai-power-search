import { Button } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';

import successIcon from 'assets/images/authenticate-success.png';

import { LayoutSecondary } from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import { useTranslation } from 'hooks/useTranslation';

import getHashParams from 'helpers/getHashParams';

import { APP_PROTOCOL_ROUTE, DESKTOP_APP_ROUTES } from 'constants/desktopApp/router';

import styles from './VerifyDropboxForm.module.scss';

const VerifyDropboxForm = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { code, token, errorMessage, searchParams } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const codeParam = params.get('code');
    const tokenParam = getHashParams('access_token', false);
    const errorParam = params.get('error');
    const errorDescriptionParam = params.get('error_description');
    const stateParam = params.get('state') || getHashParams('state', false);
    const errorMessageParam = errorDescriptionParam || (errorParam ? errorParam.replace('_', ' ') : '');

    const dropboxSearchParams = new URLSearchParams();
    dropboxSearchParams.set('provider', 'dropbox');
    if (tokenParam) {
      dropboxSearchParams.set('token', tokenParam);
    }
    if (codeParam) {
      dropboxSearchParams.set('code', codeParam);
    }
    if (stateParam) {
      dropboxSearchParams.set('state', stateParam);
    }
    if (errorParam || errorMessageParam) {
      dropboxSearchParams.set('error', errorDescriptionParam || errorParam || errorMessageParam);
    }

    return {
      code: codeParam,
      token: tokenParam,
      error: errorParam,
      errorDescription: errorDescriptionParam,
      state: stateParam,
      errorMessage: errorMessageParam,
      searchParams: dropboxSearchParams,
    };
  }, [location.search]);

  const searchParamsString = searchParams.toString();

  const handleOpenDesktopApp = useCallback(() => {
    window.location.href = `${APP_PROTOCOL_ROUTE}${DESKTOP_APP_ROUTES.OAUTH2_CALLBACK_ROUTE}?${searchParamsString}`;
  }, [searchParamsString]);

  useEffect(() => {
    if (!window.opener) {
      handleOpenDesktopApp();
      return;
    }

    const opener = window.opener as Window;

    if (code) {
      opener.postMessage({ code, errorMessage }, window.location.origin);
    }
    if (token) {
      opener.postMessage({ token, errorMessage }, window.location.origin);
    } else {
      opener.postMessage({ cancelAuthorize: true }, window.location.origin);
    }
    window.close();
  }, [code, token, errorMessage, searchParams, handleOpenDesktopApp]);

  const getSuccessDescription = (): string =>
    !window.opener
      ? t('authenPage.verifyDropbox.successfulDescriptionDesktopApp')
      : t('authenPage.verifyDropbox.successfulDescription');

  const getFailedDescription = (): string =>
    !window.opener
      ? t('authenPage.verifyDropbox.failedDescriptionDesktopApp')
      : t('authenPage.verifyDropbox.failedDescription');

  const getTitle = (): string =>
    errorMessage ? t('authenPage.verifyDropbox.failedTitle') : t('authenPage.verifyDropbox.successfulTitle');

  const getDescription = (): string => (errorMessage ? getFailedDescription() : getSuccessDescription());

  return (
    <LayoutSecondary>
      <div className={styles.logoContainer}>
        <img src={successIcon} alt="Lumin Logo" className={styles.logo} />
        <h1 className={styles.title}>{getTitle()}</h1>
        <p className={styles.description}>{getDescription()}</p>
        {!window.opener && (
          <div className={styles.buttonsContainer}>
            <Button size="lg" onClick={handleOpenDesktopApp}>
              {t('authenPage.verifyDropbox.openDesktopApp')}
            </Button>
          </div>
        )}
      </div>
    </LayoutSecondary>
  );
};

export default VerifyDropboxForm;
