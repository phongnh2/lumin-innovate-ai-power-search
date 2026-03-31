import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import DATA_ELEMENT from 'constants/dataElement';

import RubberStampModal from './RubberStampModal';

const mapStateToProps = (state) => ({
  isOpen: selectors.isElementOpen(state, DATA_ELEMENT.RUBBER_STAMP_MODAL),
});

export default compose(connect(mapStateToProps, null))(RubberStampModal);
