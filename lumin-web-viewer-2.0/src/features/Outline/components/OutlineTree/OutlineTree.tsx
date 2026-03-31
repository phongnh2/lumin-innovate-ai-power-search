import React from 'react';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';

import { DndProvider } from '@libs/react-dnd';

import actions from 'actions';
import selectors from 'selectors';
import { AppDispatch } from 'store';

import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { OutlineEvent } from 'features/Outline/types';

import { IDocumentBase } from 'interfaces/document/document.interface';

import OutlinesDragLayer from './OutlinesDragLayer';
import { useOutlineTreeContext } from '../../contexts/Outline.context';
import { OutlineItem } from '../OutlineItem';
import { OutlineItemFooter } from '../OutlineItemFooter';
import { OutlineModal } from '../OutlineModal';
import * as Styled from '../OutlinePanel.styled';

interface IProps {
  outlineEvent?: OutlineEvent;
  canModifyOutline: boolean;
}

const defaultProps = {
  outlineEvent: OutlineEvent.ADD,
};

const OutlineTree = (props: IProps) => {
  const { outlineEvent, canModifyOutline } = {
    ...defaultProps,
    ...props,
  };

  const { t } = useTranslation();
  const { outlines, moveOutlineInward, moveOutlineBeforeTarget, moveOutlineAfterTarget } = useOutlineTreeContext();

  if (outlines.length === 0) {
    // NO outlines Docs, clicked Add Outline
    if (outlineEvent === OutlineEvent.ADD) {
      return (
        <Styled.OutlineTree>
          <OutlineModal eventType={outlineEvent} />
        </Styled.OutlineTree>
      );
    }

    // No outlines Docs, default
    return (
      <Styled.EmptyOutlinesWrapper>
        <SvgElement content="new-empty-outline" width="fit-content" height={80} />
        <Styled.EmptyOutlineTitle>{t('common.documentHasNoOutlines')}</Styled.EmptyOutlineTitle>
      </Styled.EmptyOutlinesWrapper>
    );
  }

  return (
    <Styled.OutlineTree className="custom-scrollbar-reskin">
      <DndProvider>
        <OutlinesDragLayer />
        <Styled.OutlineTreeWrapper>
          <div>
            {outlines.map((outline) => (
              <OutlineItem
                key={outline.pathId}
                outline={outline}
                moveOutlineInward={moveOutlineInward}
                moveOutlineBeforeTarget={moveOutlineBeforeTarget}
                moveOutlineAfterTarget={moveOutlineAfterTarget}
                canModifyOutline={canModifyOutline}
              />
            ))}
          </div>
          {outlines.length > 1 && (
            <OutlineItemFooter
              outline={outlines[outlines.length - 1]}
              moveOutlineInward={moveOutlineInward}
              moveOutlineBeforeTarget={moveOutlineBeforeTarget}
              moveOutlineAfterTarget={moveOutlineAfterTarget}
              canModifyOutline={canModifyOutline}
            />
          )}
        </Styled.OutlineTreeWrapper>
      </DndProvider>
    </Styled.OutlineTree>
  );
};

const mapStateToProps = (state: any) => ({
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
  outlineEvent: selectors.getOutlineEvent(state),
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setCurrentDocument: (document: IDocumentBase) => dispatch(actions.setCurrentDocument(document) as AnyAction),
});

export default connect(mapStateToProps, mapDispatchToProps)(OutlineTree);
