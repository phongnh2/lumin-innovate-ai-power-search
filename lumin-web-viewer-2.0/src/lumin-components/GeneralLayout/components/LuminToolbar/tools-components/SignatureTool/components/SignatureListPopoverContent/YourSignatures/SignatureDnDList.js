import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { toolbarActions, toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';
import selectors from 'selectors';

import Tooltip from 'lumin-components/GeneralLayout/general-components/Tooltip';
import { createViewerPortal } from 'lumin-components/PortalHolder/PortalHolder';

import { useTranslation } from 'hooks';

import { signature } from 'utils';

import { useSignatureCapacities } from 'features/Signature';

import { DataElements } from 'constants/dataElement';

import SignatureItem from './SignatureItem';

import * as Styled from './YourSignatures.styled';

const optionalPortal = ({ draggableProps }, element) => {
  if (draggableProps.style.position === 'fixed') {
    return createViewerPortal(element);
  }
  return element;
};

function SignatureDnDList({
  sortedSignatures,
  onDragEnd,
  isOffline,
  deletingIndex,
  maximumNumberSignature,
  currentUser,
  userSignatures,
  isSavingSignature,
  onClick,
  onMouseUp,
  onMouseDown,
  onDelete,
  loader,
  closeElement,
  isToolbarPopoverVisible,
  resetToolbarPopover,
}) {
  const { t } = useTranslation();
  const { canReorder, canItemDelete } = useSignatureCapacities();

  const renderSignatureItem = (signatureItem, index, draggableSnapshot) => {
    const numberSignature = signature.getNumberOfSignatures(currentUser);

    const { remoteId, index: signatureIndex } = signatureItem;
    const isDisabledDelete = !canItemDelete({ remoteId });
    const showTooltip = index >= maximumNumberSignature && !remoteId;

    const onClickSignatureItem = () => {
      if (isToolbarPopoverVisible) {
        closeElement(DataElements.TOOLBAR_POPOVER);
        resetToolbarPopover();
      }
      onClick(signatureIndex);
    };

    return (
      <Tooltip title={showTooltip ? t('viewer.signatureOverlay.signatureIsKeptInLocalStorage') : null}>
        <div>
          <SignatureItem
            key={signatureIndex}
            signatureIndex={signatureIndex}
            signatureItem={signatureItem}
            isDragging={draggableSnapshot.isDragging}
            deletingIndex={deletingIndex}
            onClick={onClickSignatureItem}
            isLastSignatureItem={index === numberSignature - 1}
            onDeleteSignature={(e) => {
              onDelete({ e, remoteId, signatureIndex });
            }}
            userSignatures={userSignatures}
            isOffline={isOffline}
            isLoading={isSavingSignature}
            onMouseDown={() => onMouseDown(signatureItem)}
            onMouseUp={onMouseUp}
            isDisabledDelete={isDisabledDelete}
          />
        </div>
      </Tooltip>
    );
  };

  const renderDnDSignatureItem = ({ signatureItem, index }) => {
    const itemKey = signatureItem.remoteId;
    return (
      <Draggable key={itemKey} draggableId={itemKey} index={index} isDragDisabled={!canReorder()}>
        {(draggableProvided, draggableSnapshot) => (
          <div>
            {optionalPortal(
              draggableProvided,
              <div
                ref={draggableProvided.innerRef}
                {...draggableProvided.draggableProps}
                {...draggableProvided.dragHandleProps}
                style={draggableProvided.draggableProps.style}
              >
                {renderSignatureItem(signatureItem, index, draggableSnapshot)}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppableSignature2">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Styled.DnDListWrapper data-cy="dnd_list_wrapper">
              {sortedSignatures.map((signatureItem, index) =>
                renderDnDSignatureItem({ signatureItem, index, snapshot })
              )}
              {loader}
            </Styled.DnDListWrapper>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

SignatureDnDList.propTypes = {
  sortedSignatures: PropTypes.array.isRequired,
  onDragEnd: PropTypes.func,
  isOffline: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  activeIndex: PropTypes.string,
  deletingIndex: PropTypes.string,
  maximumNumberSignature: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
  isSavingSignature: PropTypes.bool.isRequired,
  onMouseUp: PropTypes.func,
  onMouseDown: PropTypes.func,
  onDelete: PropTypes.func,
  userSignatures: PropTypes.array,
  isDragDisabled: PropTypes.bool,
  loader: PropTypes.element,
  closeElement: PropTypes.func.isRequired,
  isToolbarPopoverVisible: PropTypes.bool.isRequired,
  resetToolbarPopover: PropTypes.func.isRequired,
};

SignatureDnDList.defaultProps = {
  onDragEnd: () => {},
  onClick: () => {},
  activeIndex: null,
  deletingIndex: null,
  currentUser: {},
  onMouseUp: () => {},
  onMouseDown: () => {},
  onDelete: () => {},
  userSignatures: [],
  isDragDisabled: false,
  loader: null,
};
const mapStateToProps = (state) => ({
  isSavingSignature: selectors.isSavingSignature(state),
  userSignatures: selectors.getUserSignatures(state),
  isToolbarPopoverVisible: toolbarSelectors.isToolbarPopoverVisible(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeElement: (element) => dispatch(actions.closeElement(element)),
  resetToolbarPopover: () => dispatch(toolbarActions.resetToolbarPopover()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignatureDnDList);
