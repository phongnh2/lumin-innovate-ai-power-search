import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import SearchOverlayPopper from './SearchOverlayPopper';

const mapStateToProps = (state) => ({
  isOpen: selectors.isElementOpen(state, 'searchOverlayPopper'),
  isSearchOverlayOpen: selectors.isElementOpen(state, 'searchOverlay'),
  isSearchPanelOpen: selectors.isElementOpen(state, 'searchPanel'),
});

const mapDispatchToProps = {
  closeElements: actions.closeElements,
  openElement: actions.openElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchOverlayPopper);
