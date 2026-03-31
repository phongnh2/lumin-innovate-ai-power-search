import React, { ComponentType, useContext } from 'react';
import { useNavigate } from 'react-router';

import ContextMenu from 'luminComponents/ContextMenu';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';

import { getTemplateLink } from 'utils/template';

import { DocumentTemplateActions } from 'constants/documentConstants';

import { DocumentTemplate } from 'interfaces/document/document.interface';

type WithRightClickTemplateProps = {
  document: DocumentTemplate;
  uploading?: boolean;
};

export const withRightClickTemplate =
  <T extends WithRightClickTemplateProps>(WrappedComponent: ComponentType<T>) =>
  (props: T & { withAuthorize: (action: string) => boolean }) => {
    const { document: selectedDocument, uploading, withAuthorize } = props;
    const navigate = useNavigate();
    const { externalDocumentExistenceGuard } = useContext(DocumentListContext) || {};

    const openInCurrentTab = () => {
      externalDocumentExistenceGuard(selectedDocument, () => navigate(getTemplateLink(selectedDocument._id)));
    };

    const openInNewTab = () => {
      externalDocumentExistenceGuard(selectedDocument, () =>
        window.open(getTemplateLink(selectedDocument._id), '_blank')
      );
    };

    if (uploading || !withAuthorize(DocumentTemplateActions.EditTemplate)) {
      return <WrappedComponent {...props} />;
    }

    return (
      <ContextMenu id={selectedDocument._id} openInNewTab={openInNewTab} openInCurrentTab={openInCurrentTab}>
        <WrappedComponent {...props} />
      </ContextMenu>
    );
  };
