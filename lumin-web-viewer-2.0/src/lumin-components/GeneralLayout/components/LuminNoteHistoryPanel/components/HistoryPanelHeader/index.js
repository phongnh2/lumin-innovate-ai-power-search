import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import HistoryPanelHeader from './HistoryPanelHeader';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  sortStrategy: selectors.getSortStrategy(state),
  exportNoteOption: selectors.getShowNotesOption(state),
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  sortComment: (value) => dispatch(actions.setSortStrategy(value)),
  setShowNotesOption: (option) => dispatch(actions.setShowNotesOption(option)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPanelHeader);
