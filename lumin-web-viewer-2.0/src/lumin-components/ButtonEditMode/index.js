import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import ButtonEditMode from './ButtonEditMode';

const mapStateToProps = (state) => ({
  isPageEditMode: selectors.isPageEditMode(state),
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  openPageEditMode: () => dispatch(actions.openPageEditMode()),
  closePageEditMode: () => dispatch(actions.closePageEditMode()),
  changePageEditDisplayMode: (displayMode) => dispatch(actions.changePageEditDisplayMode(displayMode)),
  setActiveEditMode: () => dispatch(actions.setActiveEditMode()),
  setDeactiveEditMode: () => dispatch(actions.setDeactiveEditMode()),
  closeElements: (dataElement) => dispatch(actions.closeElements(dataElement)),
  openElement: (dataElement) => dispatch(actions.openElement(dataElement)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ButtonEditMode));
