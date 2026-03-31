import { withApollo } from '@apollo/client/react/hoc';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import ProfileButton from './ProfileButton';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  organizations: selectors.getOrganizationList(state),
  currentOrganization: selectors.getCurrentOrganization(state),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  signOutUser: () => dispatch(actions.signOutUser()),
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  closeModal: () => dispatch(actions.closeModal()),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withApollo)(ProfileButton);
