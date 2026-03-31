import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import ToolGroupButton from './ToolGroupButton';

const mapStateToProps = (state, ownProps) => ({
  isActive: selectors.getActiveToolGroup(state) === ownProps.toolGroup,
  isActive2: selectors.getActiveToolGroup(state),
  activeToolName: selectors.getActiveToolName(state),
  toolButtonObjects: selectors.getToolButtonObjects(state),
  isOpen: selectors.isElementOpen(state, 'toolsOverlay'),
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  isOffline: selectors.isOffline(state),
  isLoadingDocument: selectors.isLoadingDocument(state),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  toggleElement: actions.toggleElement,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
  setActiveToolGroup: actions.setActiveToolGroup,
  openModal: actions.openModal,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(ToolGroupButton);
