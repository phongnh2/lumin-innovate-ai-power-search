import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import core from 'core';

import { POPPER_SCROLL_CN } from 'lumin-components/RubberStampOverlay/constants';
import SvgElement from 'lumin-components/SvgElement';
import AppCircularLoading from 'luminComponents/AppCircularLoading';
import { getRubberStampProperty } from 'luminComponents/RubberStampOverlay/utils';

import { useTranslation } from 'hooks';

import { updateUserAnnotationPosition } from 'services/graphServices/userAnnotation';

import DATA_ELEMENTS from 'constants/dataElement';
import { TOOLS_NAME } from 'constants/toolsName';

import RubberStampItem from '../RubberStampItem';

import * as styles from './RubberStampListContent.v2.styled';

const validNumber = (number) => typeof number === 'number' && number >= 0;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const RubberStampListContent = ({
  loading,
  closePopper,
  closeElements,
  rubberStamps,
  overrideWholeRubberStampList,
  setPlacingMultipleRubberStamp,
  renderCreateButton,
}) => {
  const draggingIndex = useRef(-1);
  const { t } = useTranslation();

  const [isDropDisabled, setIsDropDisabled] = useState(false);

  const layoutConfigs = {
    className: {},
    css: {
      emptyContainer: styles.emptyContainer,
      listItems: styles.listItems,
    }
  };

  const addRubberStamp = useCallback(
    async (rubberStamps) => {
      const data = getRubberStampProperty(rubberStamps[draggingIndex.current].property);
      closeElements(DATA_ELEMENTS.RUBBER_STAMP_OVERLAY);
      closePopper();

      core.setToolMode(TOOLS_NAME.RUBBER_STAMP);
      const rubberStampTool = core.getTool(TOOLS_NAME.RUBBER_STAMP);
      rubberStampTool.addCustomStamp(data);
      const rubberStampAnnotation = await rubberStampTool.createCustomStampAnnotation(data);
      await rubberStampTool.setRubberStamp(rubberStampAnnotation);
      rubberStampTool.showPreview();
    },
    [rubberStamps]
  );

  const onDragStart = ({ source }) => {
    setPlacingMultipleRubberStamp(false);
    draggingIndex.current = source.index;
  };

  const onDragEnd = async ({ destination, source }) => {
    draggingIndex.current = -1;

    if (!destination) {
      return;
    }
    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    const _rubberStamps = reorder(rubberStamps, sourceIndex, destinationIndex);
    overrideWholeRubberStampList({ data: _rubberStamps });
    const [{ _id: sourceId }, { _id: destinationId }] = [rubberStamps[sourceIndex], rubberStamps[destinationIndex]];

    await updateUserAnnotationPosition({
      destinationId,
      sourceId,
    });
  };

  const onSelectStamp = useCallback(() => {
    if (validNumber(draggingIndex.current)) {
      addRubberStamp(rubberStamps);
      draggingIndex.current = -1;
      closeElements(DATA_ELEMENTS.RUBBER_STAMP_OVERLAY);
      closePopper();
    }
  }, [rubberStamps]);

  const onMouseLeave = useCallback(() => {
    onSelectStamp();
  }, [onSelectStamp]);

  useEffect(() => {
    const onMouseLeave = () => {
      if (validNumber(draggingIndex.current)) {
        addRubberStamp(rubberStamps);
        draggingIndex.current = -1;
        closeElements(DATA_ELEMENTS.RUBBER_STAMP_OVERLAY);
        closePopper();
      }
    };
    const element = document.querySelector(`.${POPPER_SCROLL_CN}`);
    element.addEventListener('mouseleave', onMouseLeave);
    return () => {
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [onMouseLeave]);

  const renderEmptyContainer = () => {
    if (!loading) {
      return (
        <div className={layoutConfigs.className.emptyContainer} css={layoutConfigs.css.emptyContainer}>
          <SvgElement content="rubber-stamp" width={80} height={65} />
          <span>{t('viewer.stamp.hasNoStamps')}</span>
          {renderCreateButton()}
        </div>
      );
    }
    return <AppCircularLoading />;
  };

  return rubberStamps.length ? (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable droppableId="rubber-stamp-droppable" isDropDisabled={isDropDisabled}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            css={layoutConfigs.css.listItems}
          >
            {rubberStamps.map((rubberStamp, index) => (
              <RubberStampItem
                key={rubberStamp._id}
                rubberStamp={rubberStamp}
                index={index}
                setIsDropDisabled={setIsDropDisabled}
                closePopper={closePopper}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
    renderEmptyContainer()
  );
};

RubberStampListContent.propTypes = {
  closeElements: PropTypes.func,
  rubberStamps: PropTypes.array,
  overrideWholeRubberStampList: PropTypes.func,
  setPlacingMultipleRubberStamp: PropTypes.func.isRequired,
  renderCreateButton: PropTypes.func,
  closePopper: PropTypes.func,
  loading: PropTypes.bool,
};
RubberStampListContent.defaultProps = {
  closeElements: (f) => f,
  rubberStamps: [],
  overrideWholeRubberStampList: (f) => f,
  renderCreateButton: (f) => f,
  closePopper: (f) => f,
  loading: true,
};

export default RubberStampListContent;
