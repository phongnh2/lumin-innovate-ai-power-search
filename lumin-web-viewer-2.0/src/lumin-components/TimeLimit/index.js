import { connect } from 'react-redux';

import selectors from 'selectors';

import TimeLimit from './TimeLimit';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps, null)(TimeLimit);
