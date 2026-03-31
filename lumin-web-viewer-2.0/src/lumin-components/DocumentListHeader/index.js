import actions from 'actions';
import selectors from 'selectors';
import { connect } from 'react-redux';

import DocumentListHeader from './DocumentListHeader';

const mapStateToProps = (state) => ({
  ownedFilterCondition: selectors.getCurrentOwnedFilter(state),
});

const mapDispatchToProps = (dispatch) => ({
  setOwnedFilter: (ownedFilter) => dispatch(actions.setOwnedFilter(ownedFilter)),
  setLastModifiedFilter: (lastModifiedFilter) => dispatch(actions.setLastModifiedFilter(lastModifiedFilter)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentListHeader);
