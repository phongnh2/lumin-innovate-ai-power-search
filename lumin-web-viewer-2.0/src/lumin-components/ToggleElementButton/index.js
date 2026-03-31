import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';

import ToggleElementButton from './ToggleElementButton';

const mapStateToProps = (state, ownProps) => {
  let isActive = selectors.isElementOpen(state, ownProps.element);
  if (ownProps.dataElement === 'redactionButton') {
    const isToolActive = selectors.getActiveToolName(state);
    isActive = isActive || isToolActive === 'AnnotationCreateRedaction';
  }

  return {
    className: ownProps.className || 'ToggleElementButton',
    isActive,
    isRightPanelOpen: selectors.isElementOpen(state, 'rightPanel'),
    isFormBuildPanelOpen: selectors.isElementOpen(state, DataElements.FORM_BUILD_PANEL),
    currentUser: selectors.getCurrentUser(state),
    currentDocument: selectors.getCurrentDocument(state),
    isLoadingDocument: selectors.isLoadingDocument(state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openElement: (element) => dispatch(actions.openElement(element)),
  openElements: (elements) => dispatch(actions.openElements(elements)),
  closeElements: (elements) => dispatch(actions.closeElements(elements)),
  closeElement: (element) => dispatch(actions.closeElements(element)),
  onClick: () => {
    dispatch(actions.toggleElement(ownProps.element));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToggleElementButton);
