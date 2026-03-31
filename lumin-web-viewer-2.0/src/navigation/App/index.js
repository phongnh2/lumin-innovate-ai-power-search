import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';

import withDeleteCachedFile from 'HOC/withDeleteCachedFile';
import withRouter from 'HOC/withRouter';
import withSharingQueue from 'HOC/withSharingQueue';

import App from './App';

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withRouter,
  withTranslation(),
  withDeleteCachedFile,
  withSharingQueue
)(App);
