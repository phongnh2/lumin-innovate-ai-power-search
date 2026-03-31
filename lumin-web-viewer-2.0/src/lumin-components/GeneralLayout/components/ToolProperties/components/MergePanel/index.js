import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import MergePanel from './MergePanel';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeElement: (dataElement) => dispatch(actions.closeElement(dataElement)),
  openElement: (dataElement) => dispatch(actions.openElement(dataElement)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MergePanel));
