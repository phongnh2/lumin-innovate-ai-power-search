import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetCurrentOrganization } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

import { developerApiServices, IApiKey } from 'services/developerApiServices';

import { toastUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { OrganizationRoles } from 'constants/organization.enum';

export enum ModalType {
  CREATE = 'create',
  RENAME = 'rename',
}

const useApiKey = () => {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<IApiKey | null>(null);
  const [openType, setOpenType] = useState<ModalType | null>(null);
  const [errorText, setErrorText] = useState('');
  const [apiKeys, setApiKeys] = useState<IApiKey[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const currentOrganization = useGetCurrentOrganization();
  const dispatch = useDispatch();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const { error_message: errorMessage } = error.response.data as {
        error_message: string;
      };
      return errorMessage;
    }
    return error instanceof Error ? error.message : t('common.somethingWentWrong');
  };

  const handleCloseModal = () => {
    setOpenType(null);
    setSelectedKey(null);
    setErrorText('');
  };

  const getApiKeys = async () => {
    try {
      setIsFetching(true);
      const apiKeyList = await developerApiServices.getApiKeys(currentOrganization._id);
      setApiKeys(apiKeyList);
    } catch (error) {
      toastUtils
        .error({
          message: getErrorMessage(error),
        })
        .catch(() => {});
    } finally {
      setIsFetching(false);
    }
  };

  const createApiKey = async ({ name }: { name: string }) => {
    try {
      const newApiKey = await developerApiServices.createApiKey({
        name,
        workspaceId: currentOrganization._id,
      });
      setApiKeys([...apiKeys, newApiKey]);
      toastUtils.success({ message: t('developerApi.createApiKeySuccess') }).catch(() => {});
      handleCloseModal();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const { error_message: errorMessage, error_code: errorCode } = error.response.data as {
          error_message: string;
          error_code: string;
        };
        switch (errorCode) {
          case 'api_key_limit':
            setErrorText(t('developerApi.maximumApiKeysAllowed', { count: 4 }));
            break;
          case 'same_key_name':
            setErrorText(t('developerApi.apiKeyNameAlreadyUsed'));
            break;
          default:
            setErrorText(errorMessage);
        }
      } else {
        setErrorText(getErrorMessage(error));
      }
    }
  };

  const renameApiKey = async ({ name }: { name: string }) => {
    if (!selectedKey) return;

    const otherKeys = apiKeys.filter((item) => item.id !== selectedKey.id);
    if (otherKeys.some((item) => item.name === name)) {
      setErrorText(t('developerApi.apiKeyNameAlreadyUsed'));
      return;
    }

    try {
      const updatedApiKey = await developerApiServices.renameApiKey({
        keyId: selectedKey.id,
        newName: name,
        workspaceId: currentOrganization._id,
      });
      setApiKeys(
        apiKeys.map((item) => {
          if (item.id === updatedApiKey.id) {
            return updatedApiKey;
          }
          return item;
        })
      );
      handleCloseModal();
      toastUtils.success({ message: t('developerApi.renameApiKeySuccess') }).catch(() => {});
    } catch (error) {
      toastUtils
        .error({
          message: getErrorMessage(error),
        })
        .catch(() => {});
    }
  };

  const makeKeyAsPrimary = async ({ id }: { id: string }) => {
    try {
      const updatedApiKey = await developerApiServices.makeKeyAsPrimary(id, currentOrganization._id);
      setApiKeys(
        apiKeys.map((item) => {
          if (item.id === updatedApiKey.id) {
            return updatedApiKey;
          }
          return {
            ...item,
            isPrimaryKey: false,
          };
        })
      );
      toastUtils.success({ message: t('developerApi.makePrimaryKeySuccess') }).catch(() => {});
    } catch (error) {
      toastUtils
        .error({
          message: getErrorMessage(error),
        })
        .catch(() => {});
    }
  };

  const deleteApiKey = async ({ id }: { id: string }) => {
    try {
      await developerApiServices.deleteApiKey(id, currentOrganization._id);
      const newApiKeys = apiKeys.filter((item) => item.id !== id);
      setApiKeys(newApiKeys);
      toastUtils
        .info({
          message: t('developerApi.deleteApiKeySuccess'),
        })
        .catch(() => {});
    } catch (error) {
      toastUtils
        .error({
          message: getErrorMessage(error),
        })
        .catch(() => {});
    }
  };

  const handleRename = (key: IApiKey) => {
    setOpenType(ModalType.RENAME);
    setSelectedKey(key);
  };

  const handleMakePrimary = (key: IApiKey) => {
    dispatch(
      actions.openModal({
        type: ModalTypes.INFO,
        title: t('developerApi.makePrimaryKey', { name: key.name }),
        message: (
          <Trans
            i18nKey="developerApi.makePrimaryKeyDescription"
            components={{ b: <b style={{ fontWeight: 700 }} />, br: <br /> }}
          />
        ),
        confirmButtonTitle: t('developerApi.makePrimary'),
        onConfirm: () => makeKeyAsPrimary({ id: key.id }),
        onCancel: () => {},
        useReskinModal: true,
      })
    );
  };

  const handleDelete = (key: IApiKey) => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('developerApi.deleteApiKey'),
      message: t('developerApi.deleteApiKeyDescription'),
      confirmButtonTitle: t('common.delete'),
      onConfirm: () => deleteApiKey({ id: key.id }),
      onCancel: () => {},
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalSettings));
  };

  const handleCreate = () => {
    setOpenType(ModalType.CREATE);
  };

  const canModifyApiKey = currentOrganization.userRole === OrganizationRoles.ORGANIZATION_ADMIN;

  useEffect(() => {
    getApiKeys().catch(() => {});
  }, []);

  return {
    selectedKey,
    setSelectedKey,
    openType,
    setOpenType,
    createApiKey,
    handleCloseModal,
    errorText,
    apiKeys,
    isFetching,
    handleMakePrimary,
    renameApiKey,
    handleRename,
    handleDelete,
    handleCreate,
    canModifyApiKey,
  };
};

export default useApiKey;
