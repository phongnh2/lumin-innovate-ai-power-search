import React from 'react';

import UploadHandler from 'lumin-components/UploadHandler';

import useGetUploadFolderType from 'hooks/useGetUploadFolderType';

import { uploadServices } from 'services';

import { folderType } from 'constants/documentConstants';

const withUploadContainer = (Component) => (props) => {
  const currentFolderType = useGetUploadFolderType();
  const canUploadDocuments = [
    folderType.DEVICE,
    folderType.INDIVIDUAL,
    folderType.ORGANIZATION,
    folderType.TEAMS,
  ].includes(currentFolderType);

  return (
    <UploadHandler>
      {({ upload, handleUploadProgress }) => (
        <Component
          {...props}
          onUpload={upload}
          handleUploadProgress={handleUploadProgress}
          canUpload={canUploadDocuments}
          handlerName={uploadServices.DOCUMENT_HANDLER}
        />
      )}
    </UploadHandler>
  );
};

export default withUploadContainer;
