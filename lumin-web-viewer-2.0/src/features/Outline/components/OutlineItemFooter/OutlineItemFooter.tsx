import React, { useEffect, useRef } from 'react';

import { useOutlineDndHandler } from 'features/Outline/hooks/useOutlineDndHandler';
import { TOutlineNode } from 'features/Outline/types';
import { TMoveOutlineHandler } from 'features/Outline/types/outlineTree';

import * as Styled from '../OutlinePanel.styled';

type TOutlineItemFooterProps = {
  outline: TOutlineNode;
  moveOutlineInward: TMoveOutlineHandler;
  moveOutlineBeforeTarget: TMoveOutlineHandler;
  moveOutlineAfterTarget: TMoveOutlineHandler;
  canModifyOutline: boolean;
};

const OutlineItemFooter = ({
  outline,
  moveOutlineInward,
  moveOutlineBeforeTarget,
  moveOutlineAfterTarget,
  canModifyOutline,
}: TOutlineItemFooterProps) => {
  const elementRef = useRef(null);

  const { drag, drop, isOver } = useOutlineDndHandler({
    outline,
    elementRef,
    moveOutlineInward,
    moveOutlineBeforeTarget,
    moveOutlineAfterTarget,
    forceDropBelowTarget: true,
    isDraggable: false,
    canModifyOutline,
  });

  useEffect(() => {
    drag(drop(elementRef));
  }, []);

  if (!canModifyOutline) {
    return null;
  }

  return (
    <Styled.OutlineItemFooterContainer ref={elementRef}>
      <Styled.OutlineDragLine $level={0} style={{ opacity: isOver ? 1 : 0 }} />
    </Styled.OutlineItemFooterContainer>
  );
};

export default OutlineItemFooter;
