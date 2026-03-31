import { connect } from 'react-redux';
import selectors from 'selectors';
import FavoriteIcon from './FavoriteIcon';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteIcon);
