import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';
import LoadingModal from './LoadingModal';

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'loadingModal'),
  isOpen: selectors.isElementOpen(state, 'loadingModal'),
  loadingProgress: selectors.getLoadingProgress(state),
  themeMode: selectors.getThemeMode(state),
});

const mapDispatchToProps = {
  closeElements: actions.closeElements,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoadingModal);
