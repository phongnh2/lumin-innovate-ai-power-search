import React from 'react';

import useUploadLogic from 'lumin-components/UploadHandler/hooks/useUploadLogic';
import UploadContainer from 'lumin-components/UploadHandler/UploadContainer';

import useGetUploadFolderType from 'hooks/useGetUploadFolderType';

import { uploadServices } from 'services';
import templateServices from 'services/templateServices';

import { folderType, DOCUMENT_KIND } from 'constants/documentConstants';

const withUploadTemplatesContainer = (Component) => (props) => {
  const currentFolderType = useGetUploadFolderType();
  const canUploadDocuments = [
    folderType.DEVICE,
    folderType.INDIVIDUAL,
    folderType.ORGANIZATION,
    folderType.TEAMS,
  ].includes(currentFolderType);

  const { onUploadHOC } = useUploadLogic({
    uploadServices: {
      uploadToPersonal: templateServices.uploadDocumentTemplateToPersonal,
      uploadToOrganization: templateServices.uploadDocumentTemplateToOrganization,
      uploadToOrgTeam: templateServices.uploadDocumentTemplateToOrgTeam,
    },
    kind: DOCUMENT_KIND.TEMPLATE,
    enableCaching: false, // Templates don't use caching
  });

  return (
    <UploadContainer onUpload={onUploadHOC} {...props}>
      {({ upload, handleUploadProgress }) => (
        <Component
          {...props}
          onUpload={upload}
          handleUploadProgress={handleUploadProgress}
          canUpload={canUploadDocuments}
          handlerName={uploadServices.TEMPLATE_HANDLER}
        />
      )}
    </UploadContainer>
  );
};

export default withUploadTemplatesContainer;
