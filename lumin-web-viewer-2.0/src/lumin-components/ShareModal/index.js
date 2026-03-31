import { withApollo } from '@apollo/client/react/hoc';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import withShareDocFeedback from 'HOC/withShareDocFeedback';

import ShareModalProvider from './ShareModalProvider';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  organizations: selectors.getOrganizationList(state),
  themeMode: selectors.getThemeMode(state),
});

const mapDispatchTopProps = (dispatch) => ({
  dispatch,
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  closeModal: () => dispatch(actions.closeModal()),
  openLoading: () => dispatch(actions.openElement('loadingModal')),
  closeLoading: () => dispatch(actions.closeElement('loadingModal')),
  resetFetchingStateOfDoclist: () => dispatch(actions.refreshFetchingState()),
});

export default compose(
  connect(mapStateToProps, mapDispatchTopProps),
  withApollo
)(withShareDocFeedback(ShareModalProvider));
