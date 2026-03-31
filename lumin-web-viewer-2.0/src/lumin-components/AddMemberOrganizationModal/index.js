import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { lazyWithRetry } from 'utils/lazyWithRetry';

const mapStateToProps = (state, { selectedOrganization }) => ({
  currentOrganization: selectedOrganization || selectors.getCurrentOrganization(state).data,
});

const mapDispatchToProps = (dispatch, { updateCurrentOrganization }) => ({
  updateOrganizationInList: (orgId, data) => dispatch(actions.updateOrganizationInList(orgId, data)),
  updateCurrentOrganization: (data) => {
    // reducer will check currentOrg exists before updating.
    dispatch(actions.updateCurrentOrganization(data));
    if (updateCurrentOrganization) {
      updateCurrentOrganization(data);
    }
  },
  openModal: (data) => dispatch(actions.openModal(data)),
});

const LoadableComponent = lazyWithRetry(() => import('./AddMemberOrganizationModal'));

export default connect(mapStateToProps, mapDispatchToProps)(LoadableComponent);
