import type { DraggableProvided, DraggableStateSnapshot, DroppableProvided } from '@hello-pangea/dnd';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ScrollArea } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDropzone } from 'react-dropzone';

import ImageMergeLight from 'assets/images/image_merge_light.png';

import { useTranslation } from 'hooks/useTranslation';

import { SUPPORTED_FILE_TYPES } from '../../constants';
import { FileSource } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import { MultipleMergeItem, MultipleMergeItemClone } from '../MultipleMergeItem/MultipleMergeItem';

import styles from './MultipleMergeList.module.scss';

const MultipleMergeList = () => {
  const { t } = useTranslation();

  const { documents, isLoadingDocument, handleSortDocuments, handleUploadDocuments } = useMultipleMergeContext();

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) =>
      handleUploadDocuments({ files: acceptedFiles, fileRejections, source: FileSource.LOCAL }),
    accept: SUPPORTED_FILE_TYPES,
    disabled: isLoadingDocument,
  });

  return (
    <DragDropContext onDragEnd={handleSortDocuments}>
      <Droppable
        droppableId="multiple-merge-droppable"
        renderClone={(provided, snapshot, rubric) => (
          <MultipleMergeItemClone document={documents[rubric.source.index]} provided={provided} snapshot={snapshot} />
        )}
        isDropDisabled={isLoadingDocument}
      >
        {(dropProvided: DroppableProvided) => (
          <div {...getRootProps()}>
            <ScrollArea
              scrollbars="y"
              className={styles.container}
              viewportRef={dropProvided.innerRef}
              type="always"
              {...dropProvided.droppableProps}
            >
              {isDragActive && (
                <svg className={styles.dragAndDropSvg} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    width="100%"
                    height="100%"
                    fill="none"
                    strokeDasharray="6"
                    strokeDashoffset="0"
                    strokeLinecap="square"
                    className={styles.dragAndDropBorder}
                  />
                </svg>
              )}
              {!documents.length ? (
                <div className={styles.emptyListContainer}>
                  <img className={styles.emptyListImage} src={ImageMergeLight} alt="Merge" />
                  <p className={styles.emptyListDescription}>{t('multipleMerge.emptyListDescription')}</p>
                </div>
              ) : (
                documents.map(({ _id, name, thumbnail, size, status, metadata }, index) => (
                  <Draggable key={_id} draggableId={_id} index={index} isDragDisabled={isLoadingDocument}>
                    {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                      <MultipleMergeItem
                        _id={_id}
                        isLoadingDocument={isLoadingDocument}
                        name={name}
                        thumbnail={thumbnail}
                        size={size}
                        status={status}
                        provided={dragProvided}
                        snapshot={dragSnapshot}
                        metadata={metadata}
                      />
                    )}
                  </Draggable>
                ))
              )}
              {dropProvided.placeholder}
            </ScrollArea>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default MultipleMergeList;
