import React from 'react';

import { organizationServices } from 'services';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import { DOCUMENT_KIND } from 'constants/documentConstants';

import useUploadLogic from './hooks/useUploadLogic';
import UploadContainer from './UploadContainer';

const UploadHandler = (props) => {
  const uploader = new PersonalDocumentUploadService();

  const { onUploadHOC } = useUploadLogic({
    uploadServices: {
      uploadToPersonal: uploader.upload.bind(uploader),
      uploadToOrganization: organizationServices.uploadDocumentToOrganization,
      uploadToOrgTeam: organizationServices.uploadDocumentToOrgTeam,
    },
    enableCaching: true,
    kind: DOCUMENT_KIND.DOCUMENT,
  });

  return <UploadContainer onUpload={onUploadHOC} {...props} />;
};

export default UploadHandler;
