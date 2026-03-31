import PropTypes from 'prop-types';
import React from 'react';

import MaterialPopper from 'lumin-components/MaterialPopper';
import PopperLimitContent from 'lumin-components/PopperLimitContent';
import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';
import RequestPermissionModal from 'lumin-components/RequestPermissionModal';

import { validator, eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';

import withPopperLimitWrapper from './withPopperLimitWrapper';

const propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
  match: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  themeMode: PropTypes.string.isRequired,
  toolName: PropTypes.string.isRequired,
  trackModalViewed: PropTypes.func,
  trackModalConfirmation: PropTypes.func,
  trackModalDismiss: PropTypes.func,
  currentMergeSize: PropTypes.number,
};

const defaultProps = {
  onClick: () => {},
  currentUser: null,
  currentDocument: {},
  disabled: false,
  trackModalViewed: () => {},
  trackModalConfirmation: () => {},
  trackModalDismiss: () => {},
  currentMergeSize: 0,
};

class PopperLimitWrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      openRequestModal: false,
    };
    this.buttonRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { trackModalViewed } = prevProps;
    const { isOpen } = this.state;
    if (isOpen) {
      trackModalViewed();
    }
  }

  isDocumentTour = () => {
    const { match } = this.props;
    return match.params.documentId === 'tour' || match.params.documentId === process.env.DOCUMENT_TOUR_ID;
  };

  handleOpenRequestPermissionModal = () => {
    this.setState({ openRequestModal: true });
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[DOCUMENT_ROLES.EDITOR],
    });
    this.handleClose();
  };

  renderPopperContent = () => {
    const {
      currentUser,
      currentDocument,
      toolName,
      trackModalConfirmation,
      trackModalDismiss,
      currentMergeSize,
    } = this.props;

    const featureValidation = validator.validateFeature({
      currentUser,
      currentDocument,
      isDocumentTour: this.isDocumentTour(),
      toolName,
      currentMergeSize,
    });

    return (
      <PopperLimitContent
        type={featureValidation}
        currentDocument={currentDocument}
        handleOpenModal={this.handleOpenRequestPermissionModal}
        toolName={toolName}
        trackModalConfirmation={trackModalConfirmation}
        trackModalDismiss={trackModalDismiss}
      />
    );
  };

  handleClick = () => {
    const { currentUser, currentDocument, disabled, toolName, currentMergeSize } = this.props;
    if (disabled) {
      return;
    }
    if (
      !validator.validateFeature({
        currentUser,
        currentDocument,
        toolName,
        currentMergeSize,
      })
    ) {
      if (!disabled) {
        this.props.onClick();
      }
    } else {
      this.setState({ isOpen: true });
    }
  };

  handleClose = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const { isOpen, openRequestModal } = this.state;
    const { children, themeMode, currentDocument } = this.props;
    return (
      <>
        <span
          role="button"
          tabIndex={0}
          ref={this.buttonRef}
          onClick={this.handleClick}
        >
          {children}
        </span>
        <MaterialPopper
          open={isOpen}
          classes={`theme-${themeMode}`}
          parentOverflow="window"
          disablePortal={false}
          anchorEl={this.buttonRef.current}
          handleClose={this.handleClose}
        >
          {this.renderPopperContent()}
        </MaterialPopper>
        {openRequestModal && (
          <RequestPermissionModal
            onClose={() => this.setState({ openRequestModal: false })}
            modalType={DOCUMENT_ROLES.EDITOR}
            documentId={currentDocument._id}
          />
        )}
      </>
    );
  }
}

PopperLimitWrapper.propTypes = propTypes;
PopperLimitWrapper.defaultProps = defaultProps;

export default withPopperLimitWrapper(PopperLimitWrapper);
