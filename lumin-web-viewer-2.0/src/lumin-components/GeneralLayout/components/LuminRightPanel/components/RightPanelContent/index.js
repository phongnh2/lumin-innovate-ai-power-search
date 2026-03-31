import { connect } from 'react-redux';

import selectors from 'selectors';

import RightPanelContent from './RightPanelContent';

const mapStateToProps = (state) => ({
  isRightPanelOpen: selectors.isRightPanelOpen(state),
  rightPanelValue: selectors.rightPanelValue(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RightPanelContent);
