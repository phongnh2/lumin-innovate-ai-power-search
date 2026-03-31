import { yupResolver } from '@hookform/resolvers/yup';
import { ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import CopyButton from 'ui/components/CopyButton';
import { CopyButtonType } from 'ui/components/CopyButton/constants';

import actions from 'actions';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import logger from 'helpers/logger';

import toastUtils from 'utils/toastUtils';

import { createOAuth2Client } from 'features/DeveloperApi/apis/oauth2';
import { ApplicationType, OAuth2Client, Scope } from 'features/DeveloperApi/interfaces';
import { CreateOAuth2ClientParams } from 'features/DeveloperApi/interfaces/oauth2.interface';
import styles from 'features/DeveloperApi/styles/index.module.scss';
import OAuth2SchemaBuilder from 'features/DeveloperApi/utils/OAuth2SchemaBuilder';

export const useHandleCreateApp = ({
  addOAuthClient,
  resetAppScreenState,
}: {
  addOAuthClient: (client: OAuth2Client) => void;
  resetAppScreenState: () => void;
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentOrganization = useGetCurrentOrganization();
  const validationSchema = useMemo(
    () =>
      new OAuth2SchemaBuilder()
        .addClientName()
        .addApplicationType()
        .addRedirectUris()
        .addWebsiteFields()
        .addWebhookUrl()
        .addPrivacyPolicyUrl()
        .addTermsOfUseUrl()
        .addContactEmail()
        .addFile()
        .build(),
    []
  );

  const createAppFormHandler = useForm({
    mode: 'all',
    delayError: 250,
    defaultValues: {
      clientName: '',
      redirectUris: [] as string[],
      scopes: [
        Scope.OPEN_ID,
        Scope.PROFILE_READ,
        Scope.PROFILE_SETTINGS,
        Scope.PDF_FILES,
        Scope.PDF_FILES_READ,
        Scope.SIGN_REQUEST,
        Scope.SIGN_REQUEST_READ,
        Scope.TEMPLATES,
        Scope.WORKSPACES_READ,
        Scope.AGREEMENTS,
      ],
      file: undefined,
      websiteUrl: '',
      privacyPolicyUrl: '',
      termsOfUseUrl: '',
      contactEmail: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const handleCreateApp = createAppFormHandler.handleSubmit(async (data: CreateOAuth2ClientParams) => {
    try {
      const response = await createOAuth2Client({
        ...data,
        workspaceId: currentOrganization?._id || '',
      });
      addOAuthClient(response);
      resetAppScreenState();
      if (data.applicationType === ApplicationType.CLIENT_APPLICATION) {
        toastUtils
          .success({
            message: t('developerApi.integrationApps.clientCreatedSuccessfully', {
              appName: data.clientName,
            }),
          })
          .catch(() => {});
        return;
      }
      dispatch(
        actions.openModal({
          useReskinModal: true,
          title: t('developerApi.integrationApps.applicationCreated'),
          disableEscapeKeyDown: true,
          disableBackdropClick: true,
          size: 'md',
          message: (
            <>
              <p className={styles.appInfoDescription}>
                {t('developerApi.integrationApps.clientCredentialsGenerated')}
              </p>
              <div className={styles.appInfoItem}>
                <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.appName')}</p>
                <div className={styles.appInfoValue}>{data.clientName}</div>
              </div>
              <div className={styles.appInfoItem}>
                <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.clientId')}</p>
                <div className={styles.appInfoValue}>
                  <p>{response.clientId}</p>
                  <CopyButton
                    type={CopyButtonType.SIMPLE}
                    size={ButtonSize.sm}
                    contentRef={(() => {
                      const el = document.createElement('p');
                      el.innerText = response.clientId;
                      return el;
                    })()}
                    dataCy="copy-client-id"
                  />
                </div>
              </div>
              <div className={styles.appInfoItem}>
                <p className={styles.appInfoLabel}>{t('developerApi.integrationApps.clientSecret')}</p>
                <div className={styles.appInfoValue}>
                  <p>{response.clientSecret}</p>
                  <CopyButton
                    type={CopyButtonType.SIMPLE}
                    size={ButtonSize.sm}
                    contentRef={(() => {
                      const el = document.createElement('p');
                      el.innerText = response.clientSecret;
                      return el;
                    })()}
                    dataCy="copy-client-secret"
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
    } catch (err) {
      logger.logError({
        message: 'Failed to create OAuth2 client',
        attributes: {
          context: 'INTEGRATION_OAUTH2',
        },
        error: err,
      });
    }
  });

  return {
    handleCreateApp,
    createAppFormHandler,
  };
};
