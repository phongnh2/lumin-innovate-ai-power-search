import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import EditPDFProvider from './EditPDFProvider';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = {
  setIsInContentEditMode: actions.setIsInContentEditMode,
  enableElements: actions.enableElements,
  disableElements: actions.disableElements,
  closeElements: actions.closeElements,
  openViewerModal: actions.openViewerModal,
  openElement: actions.openElement,
  setActiveHeaderGroup: actions.setActiveHeaderGroup,
  setIsShowToolbarTablet: actions.setIsShowToolbarTablet,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPDFProvider);
