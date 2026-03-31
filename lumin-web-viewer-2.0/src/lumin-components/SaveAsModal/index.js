import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import dataElements from 'constants/dataElement';

import SaveAsModal from './SaveAsModal';

const mapStateToProps = (state) => ({
  isOpen: selectors.isElementOpen(state, dataElements.SAVE_AS_MODAL),
  currentDocument: selectors.getCurrentDocument(state),
  openedElementData: selectors.getOpenedElementData(state, dataElements.SAVE_AS_MODAL),
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(actions.closeElement(dataElements.SAVE_AS_MODAL)),
  openSaveToDriveModal: () => dispatch(actions.openElement(dataElements.SAVE_TO_DRIVE)),
  setDownloadType: (type) => dispatch(actions.setDownloadType(type)),
  setupViewerLoadingModal: (args) => dispatch(actions.setupViewerLoadingModal(args)),
  openElement: (element) => dispatch(actions.openElement(element)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveAsModal);
