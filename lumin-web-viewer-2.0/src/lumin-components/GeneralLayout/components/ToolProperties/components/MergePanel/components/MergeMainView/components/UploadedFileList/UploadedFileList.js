/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-cycle */
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import React, { useContext } from 'react';

import UploadBtn from './UploadBtn';
import UploadedFileItem from './UploadedFileItem';
import { MergePanelContext } from '../../../../MergePanel';
import { MergeMainViewContext } from '../../MergeMainView';
import UploadedFileError from '../UploadedFileError';

import * as Styled from './UploadedFileList.styled';

const UploadedFileList = () => {
  const { onDrop } = useContext(MergePanelContext);
  const { filesInfo } = useContext(MergeMainViewContext);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    onDrop(result);
  };

  return (
    <Styled.FileList id="container">
      <UploadBtn wording="viewer.leftPanelEditMode.addMoreFiles" />

      <Styled.Spacing />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, { draggingOverWith, draggingFromThisWith, isDraggingOver }) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {filesInfo.map((fileInfo, index) => (
                <UploadedFileItem
                  key={fileInfo.docInstance.id}
                  fileInfo={fileInfo}
                  index={index}
                  draggingOverWith={draggingOverWith}
                  draggingFromThisWith={draggingFromThisWith}
                  isDraggingOver={isDraggingOver}
                />
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <UploadedFileError />
    </Styled.FileList>
  );
};

UploadedFileList.propTypes = {};

export default UploadedFileList;
