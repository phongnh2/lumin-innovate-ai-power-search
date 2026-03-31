import { connect, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import CustomizablePopup from './CustomizablePopup';

const mapStateToProps = (state, ownProps) => ({
  items: selectors.getPopupItems(state, ownProps.dataElement),
});

export default connect(mapStateToProps, null, null, {
  areStatePropsEqual: (next, prev) => shallowEqual(prev.getItems, next.getItems)
})(CustomizablePopup);
