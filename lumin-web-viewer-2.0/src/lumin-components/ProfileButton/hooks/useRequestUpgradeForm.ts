import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import { useForm, UseFormReturn, Resolver } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import organizationServices from 'services/organizationServices';

import logger from 'helpers/logger';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import Yup from 'utils/yup';

import { MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_DOCUMENT_NAME_LENGTH,
  ERROR_MESSAGE_INVALID_FIELD,
  ERROR_MESSAGE_NOT_CONTAIN_URL,
} from 'constants/messages';

interface FormValues {
  reason?: string;
}

interface IUseRequestUpgradeForm {
  form: UseFormReturn<FormValues>;
  handlers: {
    handleSendRequest: (data: FormValues) => Promise<void>;
    handleCancel: () => void;
  };
}

export const useRequestUpgradeForm = (orgId: string): IUseRequestUpgradeForm => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        reason: Yup.string()
          .trim()
          .max(
            MAX_LENGTH_DOCUMENT_NAME,
            t(ERROR_MESSAGE_DOCUMENT_NAME_LENGTH.key, ERROR_MESSAGE_DOCUMENT_NAME_LENGTH.interpolation)
          )
          .notContainUrl(t(ERROR_MESSAGE_NOT_CONTAIN_URL))
          .notContainHtml(t(ERROR_MESSAGE_INVALID_FIELD)),
      }),
    [t]
  );

  const form = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues: {
      reason: t('profileButton.requestUpgrade.placeholder'),
    },
  });

  const handleSendRequest = async (data: FormValues): Promise<void> => {
    try {
      modalEvent
        .modalConfirmation({
          modalName: ModalName.SIGN_REQUEST_UPGRADE,
          modalPurpose: ModalPurpose[ModalName.SIGN_REQUEST_UPGRADE],
        })
        .catch(() => {});
      await organizationServices.requestSignSeat({
        orgId,
        requestMessage: data.reason?.trim() ?? '',
      });

      dispatch(actions.closeModal());

      dispatch(
        actions.openModal({
          title: t('profileButton.requestUpgrade.successTitle'),
          message: t('profileButton.requestUpgrade.successMessage'),
          useReskinModal: true,
          hideCloseButton: true,
          confirmButtonTitle: t('common.gotIt'),
          onConfirm: () => {
            dispatch(actions.closeModal());
          },
        })
      );
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error,
        message: 'Failed to request sign seat',
      });
    }
  };

  const handleCancel = (): void => {
    modalEvent
      .modalDismiss({
        modalName: ModalName.SIGN_REQUEST_UPGRADE,
        modalPurpose: ModalPurpose[ModalName.SIGN_REQUEST_UPGRADE],
      })
      .catch(() => {});
    dispatch(actions.closeModal());
  };

  return {
    form,
    handlers: {
      handleSendRequest,
      handleCancel,
    },
  };
};
