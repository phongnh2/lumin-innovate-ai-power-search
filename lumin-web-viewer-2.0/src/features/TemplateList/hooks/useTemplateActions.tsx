import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { ExtendedDocumentModalProps } from 'luminComponents/DocumentList/HOC/withDocumentModal';

import { handleCopyTemplateLink, getTemplateLink } from 'utils/template';

import { DocumentTemplateActions } from 'constants/documentConstants';

import { DocumentTemplate } from 'interfaces/document/document.interface';

import { useDeleteTemplate } from './useDeleteTemplate';
import { useUseTemplate } from './useUseTemplate';
import { TemplateActionsType } from '../types/templateList';

type UseTemplateActionsProps = {
  document: DocumentTemplate;
  openDocumentModal: ExtendedDocumentModalProps['openDocumentModal'];
};

type UseTemplateActionsOutput = {
  actions: TemplateActionsType;
};

const useTemplateActions = ({ document, openDocumentModal }: UseTemplateActionsProps): UseTemplateActionsOutput => {
  const { deleteTemplate } = useDeleteTemplate();
  const { handleUseTemplate } = useUseTemplate({ documentId: document._id });
  const navigate = useNavigate();

  const onPreviewTemplate = useCallback(() => {
    openDocumentModal({ mode: DocumentTemplateActions.PreviewTemplate, selectedDocuments: [document] });
  }, [document, openDocumentModal]);

  const onEditTemplate = useCallback(() => {
    navigate(getTemplateLink(document._id));
  }, []);

  const onDeleteTemplate = useCallback(() => {
    deleteTemplate({ document });
  }, []);

  const onCopyLinkTemplate = useCallback(() => {
    handleCopyTemplateLink(document._id);
  }, []);

  const templateActions: TemplateActionsType = useMemo(
    () => ({
      previewTemplate: onPreviewTemplate,
      useTemplate: handleUseTemplate,
      copyLinkTemplate: onCopyLinkTemplate,
      editTemplate: onEditTemplate,
      deleteTemplate: onDeleteTemplate,
    }),
    [onPreviewTemplate, handleUseTemplate, onCopyLinkTemplate, onEditTemplate, onDeleteTemplate]
  );

  return {
    actions: templateActions,
  };
};

export default useTemplateActions;
