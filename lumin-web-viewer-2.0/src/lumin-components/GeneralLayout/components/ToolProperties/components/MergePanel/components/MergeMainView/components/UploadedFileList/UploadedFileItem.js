import { Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import DummyProgressBar from './DummyProgressBar';
import { MergePanelContext } from '../../../../MergePanel';

import * as Styled from './UploadedFileList.styled';

const round = (value, precision) => {
  const multiplier = 10 ** (precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

const UploadedFileItem = ({ fileInfo, index, isDraggingOver }) => {
  const { t } = useTranslation();
  const { removeUploadedFile } = useContext(MergePanelContext);
  const renderDesc = (_fileInfo) => {
    if (!_fileInfo.error) {
      return `${round(_fileInfo.file.size * 0.000001, 2)}MB`;
    }
    return _fileInfo.error;
  };

  const renderImg = (_fileInfo) => {
    if (_fileInfo.error || _fileInfo.loading) {
      const content = _fileInfo.error ? 'file-error' : 'file-loading';
      return (
        <SvgElement
          className="EditPanelMergePage__preview_group__svg-element"
          content={content}
          width={24}
          height={24}
        />
      );
    }

    return <Styled.Thumbnail src={_fileInfo.thumbnail} width="24" height="24" alt="file info" />;
  };

  const renderDescItem = (_fileInfo) => {
    if (!_fileInfo.loading) {
      return <Styled.FileSize $withError={_fileInfo.error}>{renderDesc(_fileInfo)}</Styled.FileSize>;
    }

    return (
      <Styled.UploadingWrapper>
        <Styled.UploadingLabel>{t('viewer.leftPanelEditMode.uploading').replace('...', '')}</Styled.UploadingLabel>
        <Styled.ProgressWrapper>
          <DummyProgressBar />
        </Styled.ProgressWrapper>
      </Styled.UploadingWrapper>
    );
  };

  return (
    <Draggable draggableId={fileInfo.docInstance.id} index={index}>
      {(draggableProvided, snapshot) => (
        <>
          <Styled.FileItem
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            $notDragging={!snapshot.isDragging}
            $dragging={snapshot.isDragging}
            $draggedOver={isDraggingOver}
            {...draggableProvided.dragHandleProps}
          >
            <Styled.HandleWrapper>
              <SvgElement width={12} height={6} content="dndHandle" />
            </Styled.HandleWrapper>

            {renderImg(fileInfo)}

            <Styled.FileDesc className="EditPanelMergePage__preview_group__desc">
              <Styled.FileName $loading={fileInfo.loading} $error={fileInfo.error}>
                {fileInfo.file.name}
              </Styled.FileName>

              {renderDescItem(fileInfo)}
            </Styled.FileDesc>

            <IconButton
              size="small"
              disabled={fileInfo.loading}
              icon="new_small_close"
              iconSize={16}
              onClick={() => removeUploadedFile(index)}
            />
          </Styled.FileItem>
          {snapshot.isDragging && <Styled.DummyItem />}
        </>
      )}
    </Draggable>
  );
};

UploadedFileItem.propTypes = {
  fileInfo: PropTypes.object,
  index: PropTypes.number,
  draggingOverWith: PropTypes.string,
  draggingFromThisWith: PropTypes.string,
  isDraggingOver: PropTypes.bool,
  removeFile: PropTypes.func,
};

UploadedFileItem.defaultProps = {
  fileInfo: {},
  index: -1,
  draggingOverWith: '',
  draggingFromThisWith: '',
  isDraggingOver: false,
  removeFile: (f) => f,
};

export default UploadedFileItem;
