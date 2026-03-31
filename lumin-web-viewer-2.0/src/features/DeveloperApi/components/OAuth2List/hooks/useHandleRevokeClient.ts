import { ModalTypes } from 'lumin-ui/kiwi-ui';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import logger from 'helpers/logger';

import toastUtils from 'utils/toastUtils';

import { deleteOAuth2Client } from 'features/DeveloperApi/apis/oauth2';
import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';

export const useHandleRevokeClient = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { removeOAuthClientById } = useApiAppContext();

  const handleRevokeClient = (id: string) => {
    dispatch(
      actions.openModal({
        useReskinModal: true,
        type: ModalTypes.warning,
        title: t('developerApi.integrationApps.revokeClient.title'),
        disableEscapeKeyDown: true,
        disableBackdropClick: true,
        message: t('developerApi.integrationApps.revokeClient.message'),
        cancelButtonTitle: t('common.cancel'),
        confirmButtonTitle: t('developerApi.integrationApps.revoke'),
        onCancel: () => {
          dispatch(actions.closeModal());
        },
        onConfirm: async () => {
          try {
            dispatch(actions.updateModalProperties({ isProcessing: true }));
            await deleteOAuth2Client({ id });
            removeOAuthClientById(id);
            toastUtils
              .success({
                message: t('developerApi.integrationApps.revokeClient.successMessage'),
              })
              .catch(() => {});
          } catch (error: unknown) {
            logger.logError({
              message: 'Failed to delete OAuth2 client',
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

  return {
    handleRevokeClient,
  };
};
