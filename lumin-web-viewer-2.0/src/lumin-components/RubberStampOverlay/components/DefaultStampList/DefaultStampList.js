import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ScrollArea } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import core from 'core';

import { leftSideBarActions } from 'lumin-components/GeneralLayout/components/LuminLeftSideBar/slices';
import { createViewerPortal } from 'lumin-components/PortalHolder/PortalHolder';
import { POPPER_SCROLL_CN } from 'lumin-components/RubberStampOverlay/constants';
import { getDefaultRubberStamps } from 'lumin-components/RubberStampOverlay/utils';
import AppCircularLoading from 'luminComponents/AppCircularLoading';

import useShallowSelector from 'hooks/useShallowSelector';

import logger from 'helpers/logger';

import { eventTracking } from 'utils';

import { selectStamps, setStamps } from 'features/RubberStamp';
import { resizeRubberStampPreview } from 'features/RubberStamp/utils/rubberStampResizer';

import { DataElements } from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

import * as styles from './DefaultStampList.v2.styled';

const DefaultStampList = ({ closeElements, setPlacingMultipleRubberStamp, closePopper, isToolbarPopoverVisible }) => {
  const rubberStamps = useShallowSelector(selectStamps);
  const [loading, setLoading] = useState(!rubberStamps);
  const dispatch = useDispatch();
  const setRubberStamps = (stamps) => dispatch(setStamps(stamps));
  const grabbing = useRef(null);

  const handleGetAnnotations = async () => {
    try {
      if (rubberStamps) {
        return;
      }
      const _rubberStamps = await getDefaultRubberStamps();
      setRubberStamps(_rubberStamps);
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.RUBBER_STAMP_ERROR,
        error: e,
      });
    } finally {
      setLoading(false);
    }
  };

  const onClick = async (rubberStampAnnotation, elementName) => {
    if (isToolbarPopoverVisible) {
      closeElements(DataElements.TOOLBAR_POPOVER);
    }
    const rubberStampTool = core.getTool(TOOLS_NAME.RUBBER_STAMP);
    core.setToolMode(TOOLS_NAME.RUBBER_STAMP);
    await rubberStampTool.setRubberStamp(rubberStampAnnotation);
    rubberStampTool.showPreview();
    const previewElement = rubberStampTool.getPreviewElement();
    await resizeRubberStampPreview({ rubberStampPreviewElement: previewElement });
    closeElements(DataElements.RUBBER_STAMP_OVERLAY);
    dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
    closePopper();
    elementName &&
      eventTracking(UserEventConstants.EventType.CLICK, {
        elementName,
      });
  };

  const onDragStart = ({ source }) => {
    setPlacingMultipleRubberStamp(false);
    const { index } = source;
    grabbing.current = rubberStamps[index].annotation;
  };

  const onDragEnd = () => {
    grabbing.current = null;
  };

  const optionalPortal = ({ draggableProps }, element) => {
    if (draggableProps.style.position === 'fixed') {
      return createViewerPortal(element);
    }
    return element;
  };

  useEffect(() => {
    handleGetAnnotations();

    const onMouseLeave = () => {
      if (grabbing.current) {
        onClick(grabbing.current);
        grabbing.current = null;
      }
    };

    const setUpOnMouseLeave = () => {
      const element = document.querySelector(`.${POPPER_SCROLL_CN}`);
      element.addEventListener('mouseleave', onMouseLeave);
      return () => {
        element.removeEventListener('mouseleave', onMouseLeave);
      };
    };
    setUpOnMouseLeave();
  }, []);

  return (
    <ScrollArea.AutoSize mah={300} css={styles.container}>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-default-stamp" isDropDisabled>
          {(provided) =>
            loading || !rubberStamps ? (
              <AppCircularLoading />
            ) : (
              <div css={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {rubberStamps.filter(Boolean).map(({ annotation, name, imgSrc, elementName }, index) => (
                  <Draggable key={name} draggableId={name} index={index}>
                    {(draggableProvided, snapshot) => (
                      <>
                        {optionalPortal(
                          draggableProvided,
                          <div
                            css={[
                              styles.item,
                              snapshot.isDragging && styles.itemDragging,
                              !snapshot.isDragging && styles.itemNotDragging,
                            ]}
                            onClick={() => onClick(annotation, elementName)}
                            ref={draggableProvided.innerRef}
                            tabIndex={0}
                            role="button"
                            {...draggableProvided.dragHandleProps}
                            {...draggableProvided.draggableProps}
                          >
                            <img alt={name} src={imgSrc} />
                          </div>
                        )}
                        {snapshot.isDragging && <div />}
                      </>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )
          }
        </Droppable>
      </DragDropContext>
    </ScrollArea.AutoSize>
  );
};

DefaultStampList.propTypes = {
  closeElements: PropTypes.func,
  closePopper: PropTypes.func,
  setPlacingMultipleRubberStamp: PropTypes.func.isRequired,
  isToolbarPopoverVisible: PropTypes.bool.isRequired,
};
DefaultStampList.defaultProps = {
  closeElements: (f) => f,
  closePopper: (f) => f,
};

export default DefaultStampList;
