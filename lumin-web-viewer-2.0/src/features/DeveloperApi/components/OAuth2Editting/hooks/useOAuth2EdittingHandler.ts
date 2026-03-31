import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'hooks';

import logger from 'helpers/logger';

import toastUtils from 'utils/toastUtils';

import { changeOAuth2ClientLogo, updateOAuth2Client } from 'features/DeveloperApi/apis/oauth2';
import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';
import { Scope } from 'features/DeveloperApi/interfaces';
import OAuth2SchemaBuilder from 'features/DeveloperApi/utils/OAuth2SchemaBuilder';

const useOAuth2EdittingHandler = () => {
  const { resetAppScreenState, appScreenState, updateOAuthClient } = useApiAppContext();
  const { t } = useTranslation();

  const validationSchema = useMemo(
    () =>
      new OAuth2SchemaBuilder()
        .addClientName()
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

  const editOAuth2FormHandler = useForm({
    mode: 'all',
    delayError: 250,
    defaultValues: appScreenState.type === 'editting' && {
      clientName: appScreenState.payload.clientName,
      scopes: appScreenState.payload.scopes.filter((scope) => scope !== Scope.OFFLINE_ACCESS),
      redirectUris: appScreenState.payload.redirectUris,
      websiteUrl: appScreenState.payload.websiteUrl,
      privacyPolicyUrl: appScreenState.payload.privacyPolicyUrl,
      termsOfUseUrl: appScreenState.payload.termsOfUseUrl,
      contactEmail: appScreenState.payload.contactEmail,
      file: appScreenState.payload.logoUri,
      applicationType: appScreenState.payload.applicationType,
      webhookUrl: appScreenState.payload.webhookUrl,
    },
    resolver: yupResolver(validationSchema),
  });
  const handleEditApp = editOAuth2FormHandler.handleSubmit(
    async (data: {
      file: File | string;
      clientName: string;
      scopes: Scope[];
      redirectUris: string[];
      websiteUrl: string;
      privacyPolicyUrl: string;
      termsOfUseUrl: string;
      contactEmail: string;
      workspaceId: string;
      webhookUrl?: string;
    }) => {
      if (appScreenState.type !== 'editting') {
        return;
      }
      const { file } = data;
      if (file instanceof File) {
        const response = await changeOAuth2ClientLogo({ id: appScreenState.payload.id, file });
        updateOAuthClient({
          logoUri: response.logoUri,
        });
      }
      try {
        const response = await updateOAuth2Client({ id: appScreenState.payload.id, data });
        updateOAuthClient({
          ...response,
          previewLogo: {
            fileId: null,
            src: null,
            expiresAt: null,
          },
        });
        toastUtils
          .success({
            message: t('developerApi.integrationApps.updateAppSuccessfully'),
          })
          .catch(() => {});
      } catch (err) {
        toastUtils
          .error({
            message: t('developerApi.integrationApps.updateAppError'),
          })
          .catch(() => {});
        logger.logError({
          message: 'Failed to update OAuth2 client',
          attributes: {
            context: 'INTEGRATION_OAUTH2',
          },
          error: err,
        });
      } finally {
        resetAppScreenState();
      }
    }
  );

  return {
    resetAppScreenState,
    editOAuth2FormHandler,
    handleEditApp,
  };
};

export default useOAuth2EdittingHandler;
