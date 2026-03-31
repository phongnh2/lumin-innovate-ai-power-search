import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import ShareDocumentOrgProvider from './ShareDocumentOrgProvider';

const mapStateToProps = (state) => ({
  organizations: selectors.getOrganizationList(state),
  themeMode: selectors.getThemeMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
  resetFetchingStateOfDoclist: () => dispatch(actions.refreshFetchingState()),
  setShouldShowRating: (shouldShow) => dispatch(actions.setShouldShowRating(shouldShow)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(ShareDocumentOrgProvider);
