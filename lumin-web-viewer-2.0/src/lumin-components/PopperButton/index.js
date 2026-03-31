import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import PopperButton from './PopperButton';

const mapDispatchToProp = {
  closeElements: actions.closeElements,
};

const mapStateToProps = (state) => ({
  isOpenModalData: selectors.isOpenModalData(state),
});

export default connect(mapStateToProps, mapDispatchToProp)(PopperButton);
