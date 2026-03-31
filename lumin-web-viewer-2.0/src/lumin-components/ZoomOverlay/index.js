import actions from 'actions';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';
import selectors from 'selectors';
import ZoomOverlay from './ZoomOverlay';

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'zoomOverlay'),
  isOpen: selectors.isElementOpen(state, 'zoomOverlay'),
  zoomList: selectors.getZoomList(state)
});

const mapDispatchToProps = {
  closeElements: actions.closeElements
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(onClickOutside(ZoomOverlay)));
