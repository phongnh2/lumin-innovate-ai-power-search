import { yupResolver } from '@hookform/resolvers/yup';
// eslint-disable-next-line import/no-unresolved
import { CaretDownIcon } from '@luminpdf/icons/dist/csr/CaretDown';
import produce from 'immer';
import { Button, enqueueSnackbar, Divider, Menu, MenuItem, Paper, Text, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Title from 'luminComponents/ShareModal/components/Title';

import { useTranslation } from 'hooks';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, getDocumentSharingPermission } from 'utils';
import errorExtract from 'utils/error';
import Yup from 'utils/yup';

import { socket } from '@socket';

import {
  DocumentActionPermissionSetting,
  useUpdateDocumentActionPermissionSettings,
  getPrincipleOptionKey,
  PERMISSION_ROLES,
} from 'features/DocumentActionPermission';

import { BULK_UPDATE_LIST_TITLE, DocumentRole } from 'constants/documentConstants';
import { LOGGER, STATUS_CODE } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';

import BulkUpdateListItem from './components/BulkUpdateListItem';

import styles from './BulkUpdateSharePermission.module.scss';

function BulkUpdateSharePermission({
  documentId,
  defaultValue,
  bulkUpdateList,
  onCancel,
  onCompleted,
  openPermissionDeniedModal,
  canBulkUpdate,
  principleList,
  enableEditDocumentActionPermission,
  currentDocument,
  updateDocument,
}) {
  const [selectedRolesPermission, setSelectedRolesPermission] = useState(() => getPrincipleOptionKey(principleList));
  const { t } = useTranslation();
  const { updateDocumentActionPermissionSettings } = useUpdateDocumentActionPermissionSettings();
  const schema = useMemo(
    () =>
      Yup.object().shape({
        permission: Yup.string().oneOf(Object.values(DocumentRole)).required(),
        [BULK_UPDATE_LIST_TITLE.INVITED_LIST]: Yup.boolean().required(),
        [BULK_UPDATE_LIST_TITLE.MEMBER_LIST]: Yup.boolean().required(),
      }),
    []
  );
  const { control, formState, handleSubmit, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      permission: DocumentRole.SPECTATOR,
      [BULK_UPDATE_LIST_TITLE.INVITED_LIST]: defaultValue === BULK_UPDATE_LIST_TITLE.INVITED_LIST,
      [BULK_UPDATE_LIST_TITLE.MEMBER_LIST]: defaultValue === BULK_UPDATE_LIST_TITLE.MEMBER_LIST,
    },
    resolver: yupResolver(schema),
  });

  const checkBoxValues = watch([BULK_UPDATE_LIST_TITLE.INVITED_LIST, BULK_UPDATE_LIST_TITLE.MEMBER_LIST]);

  const { isSubmitting, isValid } = formState;
  const isBulkUpdateSectionChanged = checkBoxValues.some(Boolean);

  const isDisabledSubmitButtonForBulkUpdate = !isBulkUpdateSectionChanged || isSubmitting || !isValid;
  const isDocPermissionSectionChanged = useMemo(
    () => selectedRolesPermission !== getPrincipleOptionKey(principleList),
    [selectedRolesPermission, principleList]
  );
  const isDisabledSubmitButton =
    (!canBulkUpdate || isDisabledSubmitButtonForBulkUpdate) &&
    (!enableEditDocumentActionPermission || !isDocPermissionSectionChanged);

  const permissions = getDocumentSharingPermission(t);
  const roles = Object.values(permissions);

  const onChangeList = ({ checked, onChange }) => {
    onChange(checked);
  };

  const handleSaveRolesPermission = async () => {
    try {
      const principles = PERMISSION_ROLES[selectedRolesPermission]?.value;
      const data = await updateDocumentActionPermissionSettings({
        documentId,
        principles,
      });
      const updatedDocument = produce(currentDocument, (draft) => {
        if (!draft.capabilities) {
          draft.capabilities = {};
        }

        draft.capabilities = {
          ...data,
        };
      });
      updateDocument(updatedDocument);
      socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, {
        roomId: documentId,
        type: SOCKET_EMIT.UPDATE_DOCUMENT_PRINCIPLE_LIST,
        data: {
          principles,
        },
      });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.BULK_UPDATE_SHARE_PERMISSION,
        error,
        message: 'Failed to update principles of document action permission',
      });
    }
  };

  const submit = async (value) => {
    if (enableEditDocumentActionPermission && isDocPermissionSectionChanged) {
      await handleSaveRolesPermission();
      if (!canBulkUpdate || !isBulkUpdateSectionChanged) {
        onCancel();
        enqueueSnackbar({
          message: t('modalShare.permissionHasBeenUpdated'),
          variant: 'success',
        });
        return;
      }
    }

    if (!isBulkUpdateSectionChanged) {
      return;
    }

    try {
      const selectedList = Object.values(BULK_UPDATE_LIST_TITLE).reduce((acc, titleValue) => {
        if (value[titleValue]) {
          return [...acc, titleValue];
        }
        return acc;
      }, []);
      await documentServices.bulkUpdateSharingPermission({
        documentId,
        list: selectedList,
        permission: value.permission.toUpperCase(),
      });

      enqueueSnackbar({
        message: t('modalShare.permissionHasBeenUpdated'),
        variant: 'success',
      });
      // update users role
      // publish socket to invited list members
      onCompleted({ ...value, selectedList });
      onCancel();
    } catch (e) {
      const { statusCode } = errorExtract.extractGqlError(e);
      if (statusCode === STATUS_CODE.FORBIDDEN) {
        openPermissionDeniedModal();
      } else {
        toastUtils.openUnknownErrorToast();
      }
    }
  };

  const renderBulkUpdateList = useCallback(
    () =>
      canBulkUpdate
        ? bulkUpdateList.map((item, index) => (
            <Controller
              name={item.value}
              control={control}
              key={index}
              render={({ field: { onChange, value } }) => (
                <BulkUpdateListItem
                  key={item.value}
                  onChange={(checked) => onChangeList({ checked, onChange })}
                  checked={value}
                  text={item.text}
                />
              )}
            />
          ))
        : [],
    [canBulkUpdate, bulkUpdateList, control]
  );

  return (
    <Paper shadow="lg" radius="lg" className={styles.container}>
      <Title
        title={enableEditDocumentActionPermission ? t('shareSettings.title') : t('modalShare.bulkUpdatePermission')}
        showBackButton
        onBack={onCancel}
        backButtonProps={{
          disabled: isSubmitting,
        }}
      />
      {enableEditDocumentActionPermission && (
        <DocumentActionPermissionSetting
          selectedRolesPermission={selectedRolesPermission}
          setSelectedRolesPermission={setSelectedRolesPermission}
        />
      )}
      {canBulkUpdate && (
        <div className={styles.bulkUpdateListContainer}>
          <p className={styles.bulkUpdateTitle}>{t('modalShare.bulkUpdatePermissions')}</p>
          <div className={styles.bulkUpdateListWrapper}>
            <ul>{renderBulkUpdateList()}</ul>
            <div className={styles.permissionContainerWrapper}>
              <Divider />
              <div className={styles.permissionContainer}>
                <Text type="body" size="md">
                  {t('modalShare.usersInTheSelectedGroup')}:
                </Text>
                <Menu
                  ComponentTarget={
                    <PlainTooltip
                      content={t('modalShare.disabledPermissionTooltip')}
                      disabled={isBulkUpdateSectionChanged && isValid}
                      maw={400}
                      position="bottom-end"
                    >
                      <Button
                        variant="text"
                        endIcon={<CaretDownIcon />}
                        data-cy="share_permision_selector"
                        disabled={!isBulkUpdateSectionChanged || !isValid}
                      >
                        <Controller
                          name="permission"
                          control={control}
                          render={({ field: { value } }) => permissions[value].text}
                        />
                      </Button>
                    </PlainTooltip>
                  }
                >
                  <Controller
                    name="permission"
                    control={control}
                    render={({ field: { onChange } }) =>
                      roles.map((item, index) => (
                        <MenuItem
                          key={index}
                          leftSection={<div className={styles.iconWrapper}>{item.icon}</div>}
                          value={item.role}
                          onClick={() => onChange(item.role)}
                          data-cy={`share_permision_${item.role}`}
                        >
                          {item.text}
                        </MenuItem>
                      ))
                    }
                  />
                </Menu>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={styles.footerWrapper}>
        <Button onClick={onCancel} variant="outlined" size="lg" disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button size="lg" onClick={handleSubmit(submit)} disabled={isDisabledSubmitButton} loading={isSubmitting}>
          {enableEditDocumentActionPermission ? t('common.saveChanges') : t('common.update')}
        </Button>
      </div>
    </Paper>
  );
}

BulkUpdateSharePermission.propTypes = {
  defaultValue: PropTypes.oneOf(Object.values(BULK_UPDATE_LIST_TITLE)),
  documentId: PropTypes.string.isRequired,
  bulkUpdateList: PropTypes.array,
  onCancel: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  openPermissionDeniedModal: PropTypes.func,
  canBulkUpdate: PropTypes.bool,
  principleList: PropTypes.array,
  enableEditDocumentActionPermission: PropTypes.bool,
  currentDocument: PropTypes.object.isRequired,
  updateDocument: PropTypes.func,
};
BulkUpdateSharePermission.defaultProps = {
  defaultValue: null,
  openPermissionDeniedModal: () => {},
  principleList: [],
  enableEditDocumentActionPermission: false,
  updateDocument: () => {},
};

export default BulkUpdateSharePermission;
