import { useSubscription } from '@apollo/client';
import { LinkSimpleIcon } from '@luminpdf/icons/dist/csr/LinkSimple';
import { NotePencilIcon } from '@luminpdf/icons/dist/csr/NotePencil';
import { WarningCircleIcon } from '@luminpdf/icons/dist/csr/WarningCircle';
import { XIcon } from '@luminpdf/icons/dist/csr/X';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, Divider, IconButton, PlainTooltip, ScrollArea, Text } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { SUB_DELETE_DOCUMENT_TEMPLATE } from 'graphQL/DocumentTemplateGraph';

import actions from 'actions';

import Loading from 'luminComponents/Loading';

import withDocumentItemAuthorization from 'HOC/withDocumentItemAuthorization';

import { useTrackingModalEvent, useTranslation } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { handleCopyTemplateLink, getTemplateLink } from 'utils/template';

import { DeleteDocumentTemplatePayload } from 'features/DocumentList/types';
import { getDocumentData } from 'features/MultipleMerge/apis';
import { useUseTemplate } from 'features/TemplateList/hooks/useUseTemplate';

import { DocumentTemplateActions } from 'constants/documentConstants';
import { ModalTypes, STATUS_CODE, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { ZoomPreviewTemplate, PageNavigation } from './components';
import usePreviewTemplate from './hooks/usePreviewTemplate';

import styles from './PreviewTemplateModal.module.scss';

const PreviewTemplateModal = ({
  selectedDocuments,
  withAuthorize,
  onClose,
}: {
  selectedDocuments: IDocumentBase[];
  withAuthorize: (action: string) => boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDocument] = selectedDocuments;

  const dispatch = useDispatch();
  const scrollViewElement = useRef<HTMLDivElement>(null);
  const documentElement = useRef<HTMLDivElement>(null);

  const currentUser = useGetCurrentUser();

  const { handleUseTemplate, isLoading: isLoadingUseTemplate } = useUseTemplate({ documentId: selectedDocument._id });

  useTrackingModalEvent({
    isOpen: true,
    modalName: ModalName.PREVIEW_TEMPLATE,
    modalPurpose: ModalPurpose[ModalName.PREVIEW_TEMPLATE],
  });

  const {
    data: documentData,
    isLoading: isLoadingDocumentData,
    isError: isErrorDocumentData,
    isSuccess: isSuccessDocumentData,
  } = useQuery({
    queryKey: ['PreviewTemplate', 'getDocumentData', selectedDocument._id],
    queryFn: ({ signal }) =>
      getDocumentData({
        documentId: selectedDocument._id,
        abortSignal: signal,
      }),
    enabled: !!selectedDocument._id,
  });

  const { isLoadingDocument, currentPage, totalPages, zoomLevel, onZoomAction } = usePreviewTemplate({
    documentData,
    documentElement,
    currentUser,
    scrollViewElement,
    isSuccessDocumentData,
    onClose,
  });

  useSubscription<{ deleteDocumentTemplate: DeleteDocumentTemplatePayload }>(SUB_DELETE_DOCUMENT_TEMPLATE, {
    variables: { clientId: currentUser._id },
    onData: ({
      data: {
        data: { deleteDocumentTemplate },
      },
    }) => {
      if (!deleteDocumentTemplate) return;
      const { statusCode, type, documentTemplateId } = deleteDocumentTemplate;
      if (statusCode !== STATUS_CODE.SUCCEED) {
        return;
      }
      switch (type) {
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_ORGANIZATION:
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_TEAMS:
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_PERSONAL: {
          if (documentTemplateId === selectedDocument._id) {
            dispatch(
              actions.openModal({
                type: ModalTypes.ERROR,
                title: t('modalDeleteTemplate.permissionExpired'),
                message: (
                  <Trans
                    i18nKey="modalDeleteTemplate.templateDeleted"
                    components={{
                      b: <b className="kiwi-message--primary" />,
                    }}
                    values={{ name: selectedDocument.name }}
                  />
                ),
                confirmButtonTitle: t('common.ok'),
                onConfirm: onClose,
                useReskinModal: true,
              })
            );
          }
          break;
        }
        default:
          break;
      }
    },
  });

  return (
    <Dialog
      size="lg"
      data-cy="preview-template-modal"
      opened
      onClose={onClose}
      styles={{
        body: {
          color: 'var(--kiwi-colors-surface-on-surface)',
        },
      }}
      padding="none"
    >
      <div className={styles.headerContainer}>
        <PlainTooltip content={selectedDocument.name} openDelay={TOOLTIP_OPEN_DELAY} position="top-start">
          <Text type="headline" size="md" ellipsis>
            {selectedDocument.name}
          </Text>
        </PlainTooltip>
        <div className={styles.headerCloseButton}>
          <IconButton icon={<XIcon width={20} height={20} />} size="md" onClick={onClose} />
        </div>
      </div>
      <div className={styles.contentContainer}>
        <ScrollArea
          classNames={{ scrollbar: styles.scrollbar }}
          viewportRef={scrollViewElement}
          className={styles.scrollArea}
        >
          {(isLoadingDocumentData || isLoadingDocument || isErrorDocumentData) && (
            <div className={styles.loadingContainer}>
              {isErrorDocumentData ? (
                <div className={styles.errorContainer}>
                  <WarningCircleIcon width={24} height={24} />
                  <div className={styles.errorText}>{t('errorMessage.unknownError')}</div>
                </div>
              ) : (
                <Loading normal size={32} useReskinCircularProgress />
              )}
            </div>
          )}
          <div ref={documentElement} className={styles.previewContent} />
        </ScrollArea>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.bottomLeftContainer}>
          <PageNavigation currentPage={currentPage} totalPages={totalPages} />
          <Divider orientation="vertical" />
          <ZoomPreviewTemplate
            zoomLevel={zoomLevel}
            onZoomAction={onZoomAction}
            isLoading={isLoadingDocumentData || isLoadingDocument}
          />
        </div>
        <div className={styles.bottomRightContainer}>
          <PlainTooltip content={t('templatePage.copyTemplateLink')}>
            <IconButton
              className={styles.bottomRightButton}
              icon={<LinkSimpleIcon width={24} height={24} />}
              size="lg"
              onClick={() => {
                handleCopyTemplateLink(selectedDocument._id);
              }}
            />
          </PlainTooltip>
          {withAuthorize(DocumentTemplateActions.EditTemplate) && (
            <PlainTooltip content={t('templatePage.editTemplate')}>
              <IconButton
                className={styles.bottomRightButton}
                icon={<NotePencilIcon width={24} height={24} />}
                size="lg"
                onClick={() => {
                  navigate(getTemplateLink(selectedDocument._id));
                }}
              />
            </PlainTooltip>
          )}
          {withAuthorize(DocumentTemplateActions.UseTemplate) && (
            <Button size="lg" onClick={handleUseTemplate} loading={isLoadingUseTemplate}>
              {t('templatePage.useTemplate')}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default withDocumentItemAuthorization(PreviewTemplateModal);
