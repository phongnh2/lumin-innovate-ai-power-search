import { ModalTypes, ButtonSize } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import CopyButton from 'ui/components/CopyButton';
import { CopyButtonType } from 'ui/components/CopyButton/constants';

import actions from 'actions';

import { useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { rotateOAuth2ClientSecret, rotateOAuth2SigningSecret } from 'features/DeveloperApi/apis/oauth2';
import styles from 'features/DeveloperApi/styles/index.module.scss';

const TYPE_CLIENT_SECRET = 'client-secret';
const TYPE_SIGNING_SECRET = 'signing-secret';

export const useRotateClientSecret = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dispatchRotateSecretModal = (type: string, id: string) => {
    const isClientSecret = type === TYPE_CLIENT_SECRET;
    let title = 'developerApi.integrationApps.rotateClientSecret.title';
    let message = 'developerApi.integrationApps.rotateClientSecret.message';
    let rotatedTitle = 'developerApi.integrationApps.rotateClientSecret.clientSecretRotated';
    let rotatedMessage = 'developerApi.integrationApps.rotateClientSecret.clientSecretRotatedMessage';
    let rotateFunction = rotateOAuth2ClientSecret;
    let rotateObjectTitle = 'developerApi.integrationApps.clientSecret';

    if (!isClientSecret) {
      title = 'developerApi.integrationApps.rotateSigningSecret.title';
      message = 'developerApi.integrationApps.rotateSigningSecret.message';
      rotatedTitle = 'developerApi.integrationApps.rotateSigningSecret.signingSecretRotated';
      rotatedMessage = 'developerApi.integrationApps.rotateSigningSecret.signingSecretRotatedMessage';
      rotateFunction = rotateOAuth2SigningSecret;
      rotateObjectTitle = 'developerApi.integrationApps.signingSecret';
    }

    dispatch(
      actions.openModal({
        useReskinModal: true,
        type: ModalTypes.warning,
        title: t(title),
        disableEscapeKeyDown: true,
        disableBackdropClick: true,
        message: <Trans i18nKey={message} components={{ b: <b /> }} />,
        cancelButtonTitle: t('common.cancel'),
        confirmButtonTitle: t('action.rotate'),
        onCancel: () => {
          dispatch(actions.closeModal());
        },
        closeOnConfirm: false,
        onConfirm: async () => {
          try {
            dispatch(actions.updateModalProperties({ isProcessing: true }));
            const response = await rotateFunction({ id });
            dispatch(
              actions.openModal({
                useReskinModal: true,
                title: t(rotatedTitle),
                size: 'md',
                disableEscapeKeyDown: true,
                disableBackdropClick: true,
                isProcessing: false,
                message: (
                  <>
                    <p className={styles.appInfoDescription}>{t(rotatedMessage)}</p>
                    <div className={styles.appInfoItem}>
                      <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.appName')}</p>
                      <div className={styles.appInfoValue}>{response.clientName}</div>
                    </div>
                    <div className={styles.appInfoItem}>
                      <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.clientId')}</p>
                      <div className={styles.appInfoValue}>
                        <p>{response.clientId}</p>
                        <CopyButton
                          type={CopyButtonType.SIMPLE}
                          size={ButtonSize.sm}
                          textContent={response.clientId}
                          dataCy="copy-client-id"
                        />
                      </div>
                    </div>
                    <div className={styles.appInfoItem}>
                      <p className={styles.appInfoLabel}>{t(rotateObjectTitle)}</p>
                      <div className={styles.appInfoValue}>
                        <p>{isClientSecret ? response.clientSecret : response.signingSecret}</p>
                        <CopyButton
                          type={CopyButtonType.SIMPLE}
                          size={ButtonSize.sm}
                          textContent={isClientSecret ? response.clientSecret : response.signingSecret}
                          dataCy={type === TYPE_CLIENT_SECRET ? 'copy-client-secret' : 'copy-signing-secret'}
                        />
                      </div>
                    </div>
                  </>
                ),
                confirmButtonTitle: t('common.gotIt'),
                onConfirm: () => {
                  dispatch(actions.closeModal());
                },
              })
            );
          } catch (error: unknown) {
            logger.logError({
              message: 'Failed to rotate OAuth2 secret',
              attributes: {
                context: 'INTEGRATION_OAUTH2',
              },
              error,
            });
          }
        },
      })
    );
  };

  const handleRotateClientSecret = (id: string) => {
    dispatchRotateSecretModal(TYPE_CLIENT_SECRET, id);
  };

  const handleRotateSigningSecret = (id: string) => {
    dispatchRotateSecretModal(TYPE_SIGNING_SECRET, id);
  };

  return {
    handleRotateClientSecret,
    handleRotateSigningSecret,
  };
};
