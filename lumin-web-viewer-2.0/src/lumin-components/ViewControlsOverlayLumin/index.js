import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';
import { compose } from 'redux';
import actions from 'actions';
import selectors from 'selectors';
import ViewControlsOverlayLumin from './ViewControlsOverlayLumin';

const mapStateToProps = (state) => ({
  displayMode: selectors.getDisplayMode(state),
  fitMode: selectors.getFitMode(state),
  isDisabled: selectors.isElementDisabled(state, 'viewControlsOverlay'),
  isOpen: selectors.isElementOpen(state, 'viewControlsOverlay')
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
  closeElements: actions.closeElements
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
  onClickOutside
)(ViewControlsOverlayLumin);
