import React, { useMemo } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { bytesToSize, UploadUtils } from 'utils';

import { ErrorCode } from 'constants/errorCode';

import ReachDocStackLimitContent from '../UploadingContent/ReachDocStackLimitContent';

import * as Styled from './UploadingItem.styled';

function UploadingContent({ status, fileSize, progress, errorMessage, errorCode, organization }) {
  const { t } = useTranslation();

  const contentByErrorCode = useMemo(
    () =>
      ({
        [ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT]: organization && (
          <ReachDocStackLimitContent content={errorMessage} organization={organization} />
        ),
      }[errorCode]),
    [errorCode, errorMessage, organization]
  );

  const renderContent = () => {
    switch (status) {
      case UploadUtils.UploadStatus.UPLOADING: {
        const byteUploaded = (fileSize / 100) * progress;
        return (
          <Styled.ProgressContainer>
            <Styled.ProgressBar progress={progress} />
            <Styled.ByteUploaded>
              {t('common.sizeOfMaxSize', {
                size: bytesToSize(byteUploaded),
                maxSize: bytesToSize(fileSize),
              })}
            </Styled.ByteUploaded>
          </Styled.ProgressContainer>
        );
      }
      case UploadUtils.UploadStatus.ERROR: {
        if (!errorMessage) {
          return null;
        }
        return contentByErrorCode || <Styled.ErrorText>{errorMessage}</Styled.ErrorText>;
      }
      default:
        return null;
    }
  };

  return renderContent();
}
const mapStateToProps = (state, props) => {
  const { errorMessage, fileData, status, progress, errorCode, organization } = selectors.getUploadingDocumentByGroupId(
    state,
    props.groupId,
    ['status', 'fileData', 'progress', 'errorMessage', 'errorCode', 'organization']
  );
  return {
    errorMessage,
    fileSize: fileData.file.size,
    status,
    progress,
    errorCode,
    organization,
  };
};
export default connect(mapStateToProps)(React.memo(UploadingContent));
