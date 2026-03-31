import { withApollo } from '@apollo/client/react/hoc';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import TeamItemGrid from './TeamItemGrid';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
  updateModalProperties: (modalSettings) => dispatch(actions.updateModalProperties(modalSettings)),
  openErrorModal: () => dispatch(actions.openErrorModal()),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withApollo, withRouter)(TeamItemGrid);
