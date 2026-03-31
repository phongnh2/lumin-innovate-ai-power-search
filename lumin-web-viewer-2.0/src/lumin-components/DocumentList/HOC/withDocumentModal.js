import produce from 'immer';
import { isArray, mergeWith } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import InfoModal from 'lumin-components/InfoModal';
import ShareDocumentOrganizationModal from 'lumin-components/ShareDocumentOrganizationModal';
import ShareModal from 'lumin-components/ShareModal';
import TemplateModal from 'lumin-components/TemplateModal';
import { CopyDocumentModalComponent } from 'lumin-components/TransferDocument/components/CopyDocumentModal';
import MoveDocumentModal from 'lumin-components/TransferDocument/components/MoveDocumentModal';
import UploadDocumentModal from 'lumin-components/TransferDocument/components/UploadDocumentModal';

import { useGetFolderType, useCreateTemplateOnDocument, useTranslation, useDocumentsRouteMatch } from 'hooks';

import fileUtils from 'utils/file';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import MultipleMergeModal from 'features/MultipleMerge/components/MultipleMergeModal/MultipleMergeModal';

import { DocumentActions, DOCUMENT_TYPE, folderType, DocumentTemplateActions } from 'constants/documentConstants';
import { INFO_MODAL_TYPE } from 'constants/lumin-common';

const RenameDocumentModal = lazyWithRetry(() => import('lumin-components/RenameDocumentModal'));
const WarningDeleteDocModal = lazyWithRetry(() => import('lumin-components/WarningDeleteDocModal'));
const PreviewTemplateModal = lazyWithRetry(() => import('features/PreviewTemplateModal'));

const withDocumentModal = (Component) => {
  const HOC = (props) => {
    const { refetchDocument } = props;
    const [settingModal, setModal] = useState({});
    const currentFolderType = useGetFolderType();
    const { t } = useTranslation();
    const documentRoutesMatched = useDocumentsRouteMatch();

    const onClose = () => setModal((prevState) => ({ ...prevState, mode: null }));
    const updateDocument = (document) =>
      setModal((prevState) =>
        produce(prevState, (draft) => {
          mergeWith(draft.selectedDocuments[0], document, (objValue, srcValue) => {
            if (isArray(objValue)) {
              return srcValue;
            }

            return undefined;
          });
        })
      );

    const { onSubmit: onSubmitCreateTemplateOnDocument } = useCreateTemplateOnDocument();

    const renderShareModal = () => {
      const { selectedDocuments } = settingModal;
      const sharingDoc = selectedDocuments[0];

      if ([DOCUMENT_TYPE.ORGANIZATION, DOCUMENT_TYPE.ORGANIZATION_TEAM].includes(sharingDoc.documentType)) {
        const isExternalOpened = currentFolderType === folderType.SHARED;
        return (
          <ShareDocumentOrganizationModal
            open
            currentDocument={sharingDoc}
            refetchDocument={refetchDocument}
            onClose={onClose}
            isExternalOpened={isExternalOpened}
            updateDocument={updateDocument}
          />
        );
      }

      return (
        <ShareModal
          onClose={onClose}
          currentDocument={sharingDoc}
          refetchDocument={refetchDocument}
          updateDocument={updateDocument}
        />
      );
    };

    const renderModals = () => {
      const { mode, selectedDocuments } = settingModal;
      if (!selectedDocuments) {
        return null;
      }
      switch (mode) {
        case DocumentActions.MakeACopy:
          return <CopyDocumentModalComponent document={selectedDocuments[0]} onClose={onClose} />;
        case DocumentActions.Rename:
          return (
            <RenameDocumentModal
              open
              onCancel={onClose}
              document={selectedDocuments[0]}
              isSelectionMode={documentRoutesMatched}
            />
          );
        case DocumentActions.Move:
          return <MoveDocumentModal documents={selectedDocuments} onClose={onClose} />;
        case DocumentActions.View:
          return (
            <InfoModal
              open
              closeDialog={onClose}
              currentTarget={selectedDocuments[0]}
              modalType={INFO_MODAL_TYPE.DOCUMENT}
            />
          );
        case DocumentActions.Remove:
          return <WarningDeleteDocModal open document={selectedDocuments[0]} onCancel={onClose} onConfirm={onClose} />;
        case DocumentActions.Share:
          return renderShareModal();
        case DocumentActions.UploadToLumin:
          return (
            <UploadDocumentModal
              visible
              document={selectedDocuments[0]}
              onClose={onClose}
              title={t('modalUploadDoc.uploadFile')}
              submitTitle={t('common.upload')}
            />
          );
        case DocumentActions.CreateAsTemplate: {
          const selectedDocument = selectedDocuments[0];
          const documentData = {
            ...selectedDocument,
            thumbnail: { file: selectedDocument.thumbnail },
            name: fileUtils.getFilenameWithoutExtension(selectedDocument.name),
          };
          return (
            <TemplateModal.CreateBaseOnDoc
              defaultValues={documentData}
              onClose={onClose}
              onSubmit={onSubmitCreateTemplateOnDocument}
            />
          );
        }
        case DocumentActions.Merge:
          return <MultipleMergeModal initialDocuments={selectedDocuments} onClose={onClose} />;
        case DocumentTemplateActions.PreviewTemplate:
          return (
            <PreviewTemplateModal
              selectedDocuments={selectedDocuments}
              document={selectedDocuments[0]}
              onClose={onClose}
            />
          );
        default:
          return null;
      }
    };

    return (
      <>
        <Component {...props} openDocumentModal={setModal} />
        {renderModals()}
      </>
    );
  };

  HOC.propTypes = {
    refetchDocument: PropTypes.func.isRequired,
  };

  return HOC;
};

export default withDocumentModal;
