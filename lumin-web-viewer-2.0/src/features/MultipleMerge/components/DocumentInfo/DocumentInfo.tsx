import React, { memo } from 'react';

import FailedDocumentInfo from './FailedDocumentInfo';
import UploadedDocumentInfo from './UploadedDocumentInfo';
import UploadingDocumentInfo from './UploadingDocumentInfo';
import { UploadDocumentErrorType, UploadStatus } from '../../enum';

type Props = {
  thumbnail?: string;
  name: string;
  size: number;
  status: string;
  errorCode?: UploadDocumentErrorType;
};

const DocumentInfo = ({ thumbnail, errorCode, name, size, status }: Props) => {
  switch (status) {
    case UploadStatus.FAILED: {
      return <FailedDocumentInfo errorCode={errorCode} name={name} />;
    }
    case UploadStatus.UPLOADING: {
      return <UploadingDocumentInfo thumbnail={thumbnail} name={name} />;
    }
    case UploadStatus.UPLOADED: {
      return <UploadedDocumentInfo thumbnail={thumbnail} name={name} size={size} />;
    }
    default: {
      return null;
    }
  }
};

export default memo(DocumentInfo);
