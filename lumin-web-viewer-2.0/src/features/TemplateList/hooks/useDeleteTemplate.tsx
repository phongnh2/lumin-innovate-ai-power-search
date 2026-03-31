import { useMutation } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetCurrentUser, useTranslation } from 'hooks';

import { templateServices } from 'services';

import logger from 'helpers/logger';

import { eventTracking } from 'utils';
import toastUtils from 'utils/toastUtils';

import { TemplateListContext } from 'features/TemplateList/contexts/TemplateList.context';
import { ActionTypes } from 'features/TemplateList/reducers/TemplateList.reducer';

import UserEventConstants from 'constants/eventConstants';
import { ModalTypes } from 'constants/lumin-common';

import { DocumentTemplate } from 'interfaces/document/document.interface';

export function useDeleteTemplate() {
  const { t } = useTranslation();
  const { dispatch: templateListDispatch } = useContext(TemplateListContext);
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();

  const { mutateAsync: deleteDocumentTemplate } = useMutation({
    mutationFn: async ({ document }: { document: DocumentTemplate }) => {
      const { _id: documentId, clientId } = document;
      try {
        dispatch(actions.updateModalProperties({ isProcessing: true }));

        await templateServices.deleteDocumentTemplate({
          documentId,
          clientId: clientId || currentUser._id,
        });

        templateListDispatch({ type: ActionTypes.DELETE_TEMPLATE, payload: { documentIds: [document._id] } });
        toastUtils.success({
          message: t('modalDeleteTemplate.templateHasBeenDeleted'),
          useReskinToast: true,
        });

        eventTracking(UserEventConstants.EventType.DELETE_TEMPLATE);

        dispatch(actions.updateModalProperties({ isProcessing: false }));
      } catch (error) {
        logger.logError({
          message: `Failed to delete template ${documentId}`,
          error: error instanceof Error ? error.message : error,
        });
      }
    },
  });

  function deleteTemplate({ document }: { document: DocumentTemplate }) {
    const { name } = document;
    dispatch(
      actions.openModal({
        type: ModalTypes.WARNING,
        title: t('modalDeleteTemplate.deleteTemplate'),
        message: (
          <Trans
            i18nKey="modalDeleteTemplate.deleteTemplateDesc"
            components={{
              b: <b className="kiwi-message--primary" />,
            }}
            values={{ name }}
          />
        ),
        onCancel: () => {},
        onConfirm: () => deleteDocumentTemplate({ document }),
        useReskinModal: true,
      })
    );
  }

  return {
    deleteTemplate,
  };
}
