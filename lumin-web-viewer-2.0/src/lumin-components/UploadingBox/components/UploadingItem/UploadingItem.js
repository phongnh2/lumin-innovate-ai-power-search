import PropTypes from 'prop-types';
import React, { useEffect, useContext } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { DocumentListContext } from 'luminComponents/DocumentList/Context';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { UploadUtils, getFileService } from 'utils';

import { Colors } from 'constants/styles';

import UploadingContent from './UploadingContent';
import UploadingThumbnail from './UploadingThumbnail';

import * as Styled from './UploadingItem.styled';

const propTypes = {
  groupId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onCancel: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  document: PropTypes.object,
};
const defaultProps = {
  thumbnail: null,
  errorMessage: null,
  document: null,
};

function UploadingItem({
  groupId,
  status,
  fileName,
  thumbnail,
  errorMessage,
  onCancel,
  onRetry,
  document,
}) {
  const { t } = useTranslation();
  const { externalDocumentExistenceGuard } = useContext(DocumentListContext) || {};

  const canOpenDocument = Boolean(document) && status === UploadUtils.UploadStatus.COMPLETED;

  const handleOpenUploadedDocInNewTab = () => {
    if (canOpenDocument) {
      externalDocumentExistenceGuard(document, () => window.open(`/viewer/${document._id}`, '_blank'));
    }
  };

  useEffect(() => {
    if (thumbnail) {
      window.URL.revokeObjectURL(thumbnail);
    }
  }, []);

  const renderRightIcon = () => {
    switch (status) {
      case UploadUtils.UploadStatus.PROCESSING:
        return <Styled.CompressingText>{t('common.compressing')}</Styled.CompressingText>;
      case UploadUtils.UploadStatus.UPLOADING:
        return (
          <Styled.IconButton onClick={() => onCancel(groupId)}>
            <Icomoon className="cancel" size={14} color={Colors.NEUTRAL_60} />
          </Styled.IconButton>
        );
      case UploadUtils.UploadStatus.COMPLETED:
        return <Icomoon className="success" size={24} color={Colors.SUCCESS_50} />;
      case UploadUtils.UploadStatus.ERROR:
        return (
          <Styled.ErrorGroup>
            {!errorMessage || errorMessage === t('errorMessage.makeSureDowloadPerms') && (
              <Styled.IconButton style={{ marginRight: 20 }} onClick={() => onRetry(groupId)}>
                <Icomoon className="retry" size={18} color={Colors.NEUTRAL_60} />
              </Styled.IconButton>
            )}
            {errorMessage !== t('errorMessage.makeSureDowloadPerms') && (
              <Icomoon className="exclamation-circle" size={24} color={Colors.SECONDARY_50} />
            )}
          </Styled.ErrorGroup>
        );
      default:
        return null;
    }
  };

  return (
    <Styled.Container $clickable={canOpenDocument} onClick={handleOpenUploadedDocInNewTab}>
      <UploadingThumbnail
        status={status}
        thumbnail={thumbnail}
      />
      <div>
        <Styled.FileName className="file-name">{fileName}</Styled.FileName>
        <UploadingContent groupId={groupId} />
      </div>
      {renderRightIcon()}
    </Styled.Container>
  );
}

UploadingItem.propTypes = propTypes;
UploadingItem.defaultProps = defaultProps;

const mapStateToProps = (state, props) => {
  const data = selectors.getUploadingDocumentByGroupId(
    state,
    props.groupId,
    ['thumbnail', 'fileData', 'status', 'errorMessage', 'document'],
  );
  return {
    thumbnail: (typeof data.thumbnail === 'string') ? getFileService.getThumbnailUrl(data.thumbnail) : data.thumbnail && window.URL.createObjectURL(data.thumbnail),
    fileName: data.fileData.file.name,
    status: data.status,
    errorMessage: data.errorMessage,
    document: data.document,
  };
};

export default connect(mapStateToProps)(React.memo(UploadingItem));
