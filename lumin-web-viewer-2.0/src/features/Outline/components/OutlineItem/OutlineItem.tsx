import Collapse from '@mui/material/Collapse';
import MenuList from '@mui/material/MenuList';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';

import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';
import Tooltip from '@new-ui/general-components/Tooltip';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useOutlineDndHandler } from 'features/Outline/hooks/useOutlineDndHandler';
import { OutlineEvent, TOutlineNode } from 'features/Outline/types';
import { TMoveOutlineHandler } from 'features/Outline/types/outlineTree';
import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { OutlineBranchContext, OutlineTreeContext } from '../../contexts/Outline.context';
import { OutlineModal } from '../OutlineModal';
import * as Styled from '../OutlinePanel.styled';

const OutlineMenu = lazyWithRetry(() => import(/* webpackPrefetch: true */ '../OutlineMenu'));

type OutlineChangedEvents = {
  addition: {
    activeOutlinePath: string,
    isAddSub: boolean,
  }
};

const OutlineItem = ({
  outline,
  outlineEvent,
  moveOutlineInward,
  moveOutlineBeforeTarget,
  moveOutlineAfterTarget,
  canModifyOutline,
}: {
  outline: TOutlineNode;
  outlineEvent: OutlineEvent;
  moveOutlineInward: TMoveOutlineHandler;
  moveOutlineBeforeTarget: TMoveOutlineHandler;
  moveOutlineAfterTarget: TMoveOutlineHandler;
  canModifyOutline: boolean;
}) => {
  const { pathId, pageNumber, name, level, children } = outline;
  const { activeOutlinePath, lastRootOutline, setActiveOutlinePath } = useContext(OutlineTreeContext);
  const { t } = useTranslation();

  const elementRef = useRef(null);
  const { drag, drop, isDraggedDownwards, isDraggedUpwards, isDragging, isNesting } = useOutlineDndHandler({
    outline,
    elementRef,
    moveOutlineInward,
    moveOutlineBeforeTarget,
    moveOutlineAfterTarget,
    canModifyOutline,
  });

  // State
  const [openLeaf, setOpenLeaf] = useState(false);
  const [visiblePopper, setVisiblePopper] = useState(false);
  const [modalHeight, setModalHeight] = useState(0);
  const dispatch = useDispatch();
  const anchorEl = useRef<HTMLDivElement>(null);
  const isLeaf = useMemo(() => isEmpty(children), [children]);

  useEffect(() => {
    drag(drop(elementRef));
  }, []);

  useEffect(() => {
    if (isNesting) {
      setOpenLeaf(true);
    }
  }, [isNesting]);

  const defaultActions = () => {
    dispatch(actions.setOutlineEvent(null));

    setActiveOutlinePath(pathId);
  };

  const onClosePopper = useCallback(() => {
    setVisiblePopper(false);
    dispatch(actions.setOutlineEvent(null));
  }, []);

  const handleBranchClick = () => {
    OutlineCoreUtils.goToOutline(outline);
    defaultActions();
  };

  const handleStrokeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    defaultActions();
    setOpenLeaf(!openLeaf);
  };

  const onMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    defaultActions();
    setVisiblePopper(!visiblePopper);
  };

  const handleDisableTooltip = () => {
    const MAX_WORDS_TITLE = 33;
    const LEVEL_WORDS_DIFFERENT = 2;

    return name.length < MAX_WORDS_TITLE - LEVEL_WORDS_DIFFERENT * level || isDragging;
  };

  const focusInputRef = useRef<HTMLInputElement>(null);

  const outlineBranchContext = useMemo(
    () => ({
      onClose: onClosePopper,
      outline,
    }),
    [onClosePopper, outline]
  );

  const outlineChangedEvents = (data: CustomEvent<OutlineChangedEvents>) => {
    if (!data.detail) {
      return;
    }

    if (data.detail.addition) {
      const { addition } = data.detail;
      if (addition.isAddSub && outline.pathId === addition.activeOutlinePath) {
        setOpenLeaf(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener(CUSTOM_EVENT.OUTLINE_CHANGED, outlineChangedEvents);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.OUTLINE_CHANGED, outlineChangedEvents);
    };
  }, []);

  const handleModalHeightChange = useCallback((height: number) => {
    setModalHeight(height);
  }, []);

  const renderOutlineModal = useCallback(() => {
    // Clicked on Node branch, Menu item, or Stroke
    const isSelectedNode = activeOutlinePath === pathId;

    // First outlines opened, or not selected at all, then click "+" at Bottom
    let isAddOutlineWithNoActivePath;
    const isDefault = activeOutlinePath === null && outlineEvent === OutlineEvent.ADD;

    if (isDefault) {
      isAddOutlineWithNoActivePath = lastRootOutline === pathId;
    }

    const isShowModal = (outlineEvent && isSelectedNode) || isAddOutlineWithNoActivePath;

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
      if (isShowModal && e.target === e.currentTarget) {
        focusInputRef.current.focus();
        (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    const wrapperHeight = isShowModal ? modalHeight || 'auto' : 0;

    return (
      <Styled.OutlineModalWrapper style={{ height: wrapperHeight }} onTransitionEnd={handleTransitionEnd}>
        <OutlineBranchContext.Provider value={outlineBranchContext}>
          {isShowModal && (
            <OutlineModal eventType={outlineEvent} focusRef={focusInputRef} onHeightChange={handleModalHeightChange} />
          )}
        </OutlineBranchContext.Provider>
      </Styled.OutlineModalWrapper>
    );
  }, [
    outlineEvent,
    activeOutlinePath,
    lastRootOutline,
    pathId,
    outlineBranchContext,
    modalHeight,
    handleModalHeightChange,
  ]);

  return (
    <>
      <Tooltip
        title={name || t('common.untitled')}
        tooltipStyle={{ maxWidth: 200 }}
        location="bottom-end"
        disableHoverListener={handleDisableTooltip()}
      >
        <div>
          <Styled.OutlineDragLine $level={level} style={{ opacity: isDraggedUpwards ? 1 : 0 }} />
          <Styled.OutlineBranch
            className={isNesting ? 'isNesting' : ''}
            ref={elementRef}
            onClick={handleBranchClick}
            $level={level}
            $isLeaf={isLeaf}
            $isGroundLevel={level === 0}
            $active={activeOutlinePath === pathId}
            $isDragging={isDragging}
            $canModifyOutline={canModifyOutline}
            data-cy="outline_item"
          >
            {!isLeaf && (
              <Styled.IconWrapper $open={openLeaf}>
                <Icomoon onClick={handleStrokeClick} className="sm_right_stroke" size={16} />
              </Styled.IconWrapper>
            )}
            <Styled.ContentWrapper>
              <Styled.ListItemContent>{name || t('common.untitled')}</Styled.ListItemContent>
              <Styled.ListItemRight ref={anchorEl}>
                <Styled.ListItemPageNumber data-cy="outline_item_page_number">{pageNumber}</Styled.ListItemPageNumber>
                {
                  canModifyOutline && (
                    <Styled.ListItemMenu>
                      <IconButton
                        onClick={onMenuClick}
                        className="menu-button"
                        icon="md_more_vertical_menu"
                        iconSize={16}
                        size="small"
                        style={{ width: '24px', height: '24px' }}
                        data-lumin-btn-name={ButtonName.OUTLINE_MENU}
                      />
                    </Styled.ListItemMenu>
                  )
                }
              </Styled.ListItemRight>
            </Styled.ContentWrapper>
          </Styled.OutlineBranch>
          <Styled.OutlineDragLine $level={level} style={{ opacity: isDraggedDownwards ? 1 : 0 }} />
        </div>
      </Tooltip>

      {canModifyOutline && renderOutlineModal()}

      {!isLeaf && (
        <Collapse in={openLeaf} timeout="auto" unmountOnExit>
          <MenuList disablePadding>
            {outline.children.map((outlineChild) => (
              <OutlineItem
                outline={outlineChild}
                key={outlineChild.pathId}
                outlineEvent={outlineEvent}
                moveOutlineInward={moveOutlineInward}
                moveOutlineBeforeTarget={moveOutlineBeforeTarget}
                moveOutlineAfterTarget={moveOutlineAfterTarget}
                canModifyOutline={canModifyOutline}
              />
            ))}
          </MenuList>
        </Collapse>
      )}

      <Popper
        open={visiblePopper && activeOutlinePath === pathId}
        anchorEl={anchorEl.current}
        placement="bottom-start"
        onClose={onClosePopper}
      >
        <OutlineBranchContext.Provider value={outlineBranchContext}>
          <OutlineMenu />
        </OutlineBranchContext.Provider>
      </Popper>
    </>
  );
};

const propTypes = {
  outline: PropTypes.object.isRequired,
  outlineEvent: PropTypes.string,
  moveOutlineInward: PropTypes.func.isRequired,
  moveOutlineBeforeTarget: PropTypes.func.isRequired,
  moveOutlineAfterTarget: PropTypes.func.isRequired,
};

const defaultProps = {
  outlineEvent: OutlineEvent.ADD,
};

OutlineItem.defaultProps = defaultProps;

OutlineItem.propTypes = propTypes;

const mapStateToProps = (state: any) => ({
  outlineEvent: selectors.getOutlineEvent(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OutlineItem);
