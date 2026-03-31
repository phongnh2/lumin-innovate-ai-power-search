import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';

import actions from 'actions';

import { useThemeMode, useFolderPathMatch, useTranslation } from 'hooks';
import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { yupUtils as Yup, toastUtils, errorUtils } from 'utils';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { RouterUtil } from 'utils/routerUtil';

import { POPPER_PERMISSION_TYPE } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { ERROR_MESSAGE_INVALID_FIELD } from 'constants/messages';

import RequestPermissionDialog from './RequestPermissionDialog';
import { RequestType } from './requestType.enum';
import RequestPermissionDialogV2 from './V2/RequestPermissionDialog';

import * as Styled from './RequestPermissionModal.styled';

type Props = {
  onClose: () => void;
  modalType: RequestType;
  documentId: string;
  refetchDocument: () => void;
};

const RequestModalName: Record<string, string> = {
  [RequestType.VIEWER]: ModalName.REQUEST_COMMENT_PERMISSION,
  [RequestType.EDITOR]: ModalName.REQUEST_EDIT_PERMISSION,
  [RequestType.SHARER]: ModalName.REQUEST_SHARE_PERMISSION,
};

const RequestPermissionModal = ({ onClose, modalType, documentId, refetchDocument }: Props): JSX.Element => {
  const { t } = useTranslation();
  const location = useLocation();
  const isViewer = RouterUtil.isViewerPath(location.pathname);
  const isUsingRequestPermissionDialogV1 = !isViewer;

  const RequestPermissionModalComponent = useMemo(
    () => (isUsingRequestPermissionDialogV1 ? RequestPermissionDialog : RequestPermissionDialogV2),
    []
  );
  const themeMode = useThemeMode();
  const themeModeProvider = Styled.theme[themeMode];
  const dispatch = useDispatch();
  const { trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: RequestModalName[modalType],
    modalPurpose: ModalPurpose[RequestModalName[modalType]],
  });

  const schema = useMemo(
    () =>
      Yup.object().shape({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        message: Yup.string().trim().notContainHtml(t(ERROR_MESSAGE_INVALID_FIELD)),
        isNotify: Yup.boolean(),
      }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      message: '' as never,
    },
    resolver: yupResolver(schema),
  });

  const isInFolderPage = useFolderPathMatch();

  const onReload = (): void => {
    onClose?.();
    if (!(isInFolderPage || isViewer)) {
      dispatch(actions.refreshFetchingState());
    }
    refetchDocument();
  };

  const openPermissionDeniedModal = (): void => {
    const modalSettings = {
      type: ModalTypes.ERROR,
      title: t('modalShare.permissionDenied'),
      message: t('modalShare.messagePermissionDenied'),
      confirmButtonTitle: t('common.gotIt'),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      onConfirm: onReload,
      useReskinModal: true,
    };
    // eslint-disable-next-line
    dispatch(actions.openModal(modalSettings));
  };

  const handleSubmitMessage = async (data: { message: string }): Promise<void> => {
    const { message } = data;
    try {
      await documentServices.requestAccessDocument({
        documentId,
        documentRole: POPPER_PERMISSION_TYPE[modalType].value.toUpperCase(),
        message,
      });
      toastUtils.success({
        message: t('common.requestHasBeenSent'),
        useReskinToast: true,
      });
    } catch (error) {
      const { code } = errorUtils.extractGqlError(error) as { code: string };
      if (code === ErrorCode.RequestAccess.REQUEST_ACCESS_ALREADY_SENT) {
        toastUtils.success({
          message: t('common.requestHasBeenSent'),
          useReskinToast: true,
        });
      } else {
        openPermissionDeniedModal();
      }
    } finally {
      onClose();
      trackModalConfirmation().catch((error: { message: string }) => {
        logger.logError({
          error,
        });
      });
    }
  };

  const handleCancel = (): void => {
    onClose();
    trackModalDismiss().catch((err: { message: string }) => {
      logger.logError({
        error: err,
      });
    });
  };

  return (
    <RequestPermissionModalComponent
      {...(isUsingRequestPermissionDialogV1 && { themeModeProvider })}
      control={control}
      handleSubmit={handleSubmit}
      handleSubmitMessage={handleSubmitMessage}
      handleCancel={handleCancel}
      onClose={onClose}
      textRequestModal={POPPER_PERMISSION_TYPE[modalType].textRequestModal}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
};

export default RequestPermissionModal;
