/* eslint-disable import/no-cycle */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { toolbarActions, toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';

import { leftSideBarActions } from 'lumin-components/GeneralLayout/components/LuminLeftSideBar/slices';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { DataElements } from 'constants/dataElement';

import { SignatureListPopoverContentContext } from '../SignatureListPopoverContent/SignatureListPopoverContentContext';

import * as Styled from './CreateSignatureModal.styled';

const OpenCreateSignatureModalBtn = ({
  openElement,
  closeElement,
  isToolbarPopoverVisible,
  resetToolbarPopover,
  closeSidebarPopover,
}) => {
  const { closePopper } = useContext(SignatureListPopoverContentContext);

  const { t } = useTranslation();
  const handleOpen = () => {
    if (isToolbarPopoverVisible) {
      closeElement(DataElements.TOOLBAR_POPOVER);
      resetToolbarPopover();
    }
    openElement('signatureModal');
    closePopper();
    closeSidebarPopover();
  };

  return (
    <Styled.CreateBtn onClick={handleOpen}>
      <Icomoon className="md_add" size={24} />

      {t('viewer.signatureOverlay.addSignature')}
    </Styled.CreateBtn>
  );
};

OpenCreateSignatureModalBtn.propTypes = {
  openElement: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  isToolbarPopoverVisible: PropTypes.bool.isRequired,
  resetToolbarPopover: PropTypes.func.isRequired,
  closeSidebarPopover: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isToolbarPopoverVisible: toolbarSelectors.isToolbarPopoverVisible(state),
});

const mapDispatchToProps = (dispatch) => ({
  openElement: (element) => dispatch(actions.openElement(element)),
  closeElement: (element) => dispatch(actions.closeElement(element)),
  resetToolbarPopover: () => dispatch(toolbarActions.resetToolbarPopover()),
  closeSidebarPopover: () => dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenCreateSignatureModalBtn);
