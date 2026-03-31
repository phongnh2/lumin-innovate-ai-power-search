import { Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import core from 'core';

import { createViewerPortal } from 'lumin-components/PortalHolder/PortalHolder';
import AppCircularLoading from 'luminComponents/AppCircularLoading';
import { getRubberStampProperty, showRubberStampPreview } from 'luminComponents/RubberStampOverlay/utils';

import { getUserAnnotations, removeUserAnnotation } from 'services/graphServices/userAnnotation';

import { DataElements } from 'constants/dataElement';
import { DOCUMENT_ANNOTATION_TYPE } from 'constants/documentConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import RubberStampDumbV2 from './RubberStampDumb/RubberStampDumb.v2';

import './RubberStampItem.scss';

const RubberStampItem = ({
  rubberStamp,
  index,
  overrideWholeRubberStampList,
  rubberStamps,
  closeElements,
  setIsDropDisabled,
  closePopper,
  isToolbarPopoverVisible,
}) => {
  const [dummySrc, setDummySrc] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const onItemClick = useCallback(() => {
    if (isToolbarPopoverVisible) {
      closeElements(DataElements.TOOLBAR_POPOVER);
    }
    showRubberStampPreview(getRubberStampProperty(rubberStamp.property), () => {
      closeElements(DataElements.RUBBER_STAMP_OVERLAY);
      closePopper();
    });
  }, [rubberStamp.property]);

  const optionalPortal = ({ draggableProps }, element) => {
    if (draggableProps.style.position === 'fixed') {
      return createViewerPortal(element);
    }
    return element;
  };

  const renderPreviewRubberStamp = useCallback(async () => {
    const rubberStampTool = core.getTool(TOOLS_NAME.RUBBER_STAMP);
    const rubberStampAnnotation = await rubberStampTool.createCustomStampAnnotation(
      getRubberStampProperty(rubberStamp.property)
    );

    const src = await rubberStampTool.getPreview(rubberStampAnnotation, { canvasHeight: 48, canvasWidth: 48 });
    setDummySrc(src);
  }, [rubberStamp]);

  const onRemoveBtnClick = async (id) => {
    try {
      setIsDisabled(true);
      setIsDropDisabled(true);
      await removeUserAnnotation(id);
      const { data } = await getUserAnnotations({
        limit: rubberStamps.length,
        skip: 0,
        type: DOCUMENT_ANNOTATION_TYPE.RUBBER_STAMP,
      });
      overrideWholeRubberStampList(data.getUserAnnotations);
    } finally {
      setIsDisabled(false);
      setIsDropDisabled(false);
    }
  };

  useEffect(() => {
    renderPreviewRubberStamp();
  }, [renderPreviewRubberStamp]);

  return (
    <Draggable draggableId={rubberStamp._id} index={index} isDragDisabled={isDisabled}>
      {(draggableProvided, snapshot) => (
        <>
          {optionalPortal(
            draggableProvided,
            <div
              {...draggableProvided.dragHandleProps}
              {...draggableProvided.draggableProps}
              ref={draggableProvided.innerRef}
            >
              {dummySrc === '' ? (
                <AppCircularLoading noTopGap />
              ) : (
                <RubberStampDumbV2
                  onClick={onItemClick}
                  dummySrc={dummySrc}
                  isDisabled={isDisabled}
                  onRemoveBtnClick={onRemoveBtnClick}
                  rubberStamp={rubberStamp}
                  isDragging={snapshot.isDragging}
                />
              )}
            </div>
          )}
        </>
      )}
    </Draggable>
  );
};

RubberStampItem.propTypes = {
  rubberStamp: PropTypes.object,
  rubberStamps: PropTypes.array,
  index: PropTypes.number,
  draggingFromThisWith: PropTypes.string,
  closeElements: PropTypes.func,
  draggingOverWith: PropTypes.func,
  overrideWholeRubberStampList: PropTypes.func,
  setIsDropDisabled: PropTypes.func,
  closePopper: PropTypes.func,
  isToolbarPopoverVisible: PropTypes.bool.isRequired,
};

RubberStampItem.defaultProps = {
  rubberStamp: {},
  rubberStamps: [],
  index: -1,
  draggingFromThisWith: '',
  closeElements: (f) => f,
  draggingOverWith: (f) => f,
  overrideWholeRubberStampList: (f) => f,
  setIsDropDisabled: (f) => f,
  closePopper: (f) => f,
};

export default RubberStampItem;
