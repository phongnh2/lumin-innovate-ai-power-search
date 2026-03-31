import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import ConvertFileModal from './ConvertFileModal';

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  openViewerModal: (modalSettings) => dispatch(actions.openViewerModal(modalSettings)),
  setDocumentNotFound: () => dispatch(actions.setDocumentNotFound()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConvertFileModal);
