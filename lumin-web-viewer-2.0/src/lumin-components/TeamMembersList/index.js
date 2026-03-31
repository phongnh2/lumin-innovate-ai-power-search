import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import TeamMembersList from './TeamMembersList';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default compose(connect(mapStateToProps))(TeamMembersList);
