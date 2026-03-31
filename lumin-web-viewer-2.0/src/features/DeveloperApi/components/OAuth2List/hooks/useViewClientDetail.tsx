import { ButtonSize } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import CopyButton from 'ui/components/CopyButton';
import { CopyButtonType } from 'ui/components/CopyButton/constants';

import actions from 'actions';

import { useTranslation } from 'hooks';

import dateUtil from 'utils/date';

import { ApplicationType, OAuth2Client } from 'features/DeveloperApi/interfaces';
import styles from 'features/DeveloperApi/styles/index.module.scss';
import { mapAppTypeToTitle } from 'features/DeveloperApi/utils/mapAppTypeToTitle';

export const useViewClientDetail = ({ oauth2Clients }: { oauth2Clients: OAuth2Client[] }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const handleViewClientDetail = (id: string) => {
    const oauth2Client = oauth2Clients.find((client) => client.id === id);
    if (!oauth2Client) {
      return;
    }
    const isServerApplication = oauth2Client.applicationType === ApplicationType.SERVER_APPLICATION;

    dispatch(
      actions.openModal({
        useReskinModal: true,
        title: t('developerApi.integrationApps.viewClientDetailTitle'),
        size: 'md',
        disableEscapeKeyDown: true,
        disableBackdropClick: true,
        isProcessing: false,
        message: (
          <>
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.appName')}</p>
              <div className={styles.appInfoValue}>{oauth2Client.clientName}</div>
            </div>
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.redirectUris')}</p>
              <div className={styles.appInfoValue}>{oauth2Client.redirectUris.join(', ')}</div>
            </div>
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.clientId')}</p>
              <div className={styles.appInfoValue}>
                <p>{oauth2Client.clientId}</p>
                <CopyButton
                  type={CopyButtonType.SIMPLE}
                  size={ButtonSize.sm}
                  contentRef={(() => {
                    const el = document.createElement('p');
                    el.innerText = oauth2Client.clientId;
                    return el;
                  })()}
                  dataCy="copy-client-id"
                />
              </div>
            </div>
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.scopes')}</p>
              <div className={styles.appInfoValue}>{oauth2Client.scopes.join(', ')}</div>
            </div>
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.type')}</p>
              <div className={styles.appInfoValue}>{mapAppTypeToTitle(oauth2Client.applicationType)}</div>
            </div>
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.creator')}</p>
              <div className={styles.appInfoValue}>{oauth2Client.owner.name}</div>
            </div>
            {isServerApplication && oauth2Client.webhookUrl && (
              <div className={styles.appInfoItem}>
                <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.webhook')}</p>
                <div className={styles.appInfoValue}>{oauth2Client.webhookUrl}</div>
              </div>
            )}
            {isServerApplication && (
              <div className={styles.appInfoItem}>
                <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.signingSecret')}</p>
                <div className={styles.appInfoValue}>
                  <p>{oauth2Client.signingSecret}</p>
                  <CopyButton
                    type={CopyButtonType.SIMPLE}
                    size={ButtonSize.sm}
                    contentRef={(() => {
                      const el = document.createElement('p');
                      el.innerText = oauth2Client.signingSecret;
                      return el;
                    })()}
                    dataCy="copy-signing-secret"
                  />
                </div>
              </div>
            )}
            <div className={styles.appInfoItem}>
              <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.creationDate')}</p>
              <div className={styles.appInfoValue}>{dateUtil.formatFullDate(oauth2Client.createdAt)}</div>
            </div>
          </>
        ),
        confirmButtonTitle: t('common.gotIt'),
        onConfirm: () => {
          dispatch(actions.closeModal());
        },
      })
    );
  };

  return {
    handleViewClientDetail,
  };
};
