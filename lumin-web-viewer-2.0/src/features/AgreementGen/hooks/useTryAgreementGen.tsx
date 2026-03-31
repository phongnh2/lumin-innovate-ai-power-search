import { useMutation } from '@tanstack/react-query';
import { get } from 'lodash';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import { getFileService } from 'utils';

import { DataElements } from 'constants/dataElement';
import { general } from 'constants/documentType';
import { AGREEMENT_GEN_APP_URL } from 'constants/urls';

import { createAgreementFromPdf } from '../apis/createAgreementFromPdf';

export const useTryAgreementGen = () => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const docRefWorkspaceUrl = get(currentDocument, 'documentReference.data.url', '');

  const { t } = useTranslation();
  const mutation = useMutation({
    mutationKey: ['createAgreementFromPdf'],
    mutationFn: async (file: File | Blob) => {
      const formData = new FormData();
      formData.append('file', file, currentDocument?.name);
      return createAgreementFromPdf({ data: formData, workspaceUrl: docRefWorkspaceUrl });
    },
    onSuccess: (data) => {
      const { agreement, flow } = data;
      const { id: agreementId, workspaceUrl } = agreement;

      const url = `${AGREEMENT_GEN_APP_URL}/workspace/${workspaceUrl}/document/${agreementId}?flow=${flow}&from=pdf-editor&action=edit-pdf`;
      window.open(url, '_blank');
    },
    onError: (error) => {
      logger.logError(error as Error);
    },
    onSettled: () => {
      dispatch(actions.closeElement(DataElements.LOADING_MODAL) as AnyAction);
    },
  });

  const sendDocToAgreementGen = async () => {
    try {
      const blob = await getFileService.getLinearizedDocumentFile(currentDocument.name, { shouldRemoveSecurity: true });
      const file = new File([blob], currentDocument.name, { type: general.PDF });
      dispatch(actions.openElement(DataElements.LOADING_MODAL) as AnyAction);
      await mutation.mutateAsync(file);
    } catch (error) {
      logger.logError(error as Error);
    }
  };

  const tryAgreementGen = async () => {
    try {
      const pdfDoc = await core.getDocument().getPDFDoc();
      const isEncrypted = await pdfDoc.isEncrypted();
      if (!isEncrypted) {
        sendDocToAgreementGen().catch(() => {});
        return;
      }

      dispatch(
        actions.openViewerModal({
          title: t('viewer.editInAgreementGen.passwordRemovedModal.title'),
          message: (
            <span>
              <Trans i18nKey="viewer.editInAgreementGen.passwordRemovedModal.message" components={{ b: <b /> }} />
            </span>
          ),
          size: 'medium',
          footerVariant: 'variant1',
          confirmButtonTitle: t('common.confirm'),
          onConfirm: sendDocToAgreementGen,
          onCancel: () => {},
        }) as AnyAction
      );
    } catch (error) {
      logger.logError(error as Error);
    }
  };

  return { tryAgreementGen };
};
