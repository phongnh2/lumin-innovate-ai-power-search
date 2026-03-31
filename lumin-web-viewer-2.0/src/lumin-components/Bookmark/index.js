import Bookmark from './Bookmark';
import { connect } from 'react-redux';
import actions from 'actions';

const mapDispatchToProps = {
  closeElement: actions.closeElement
};

export default connect(null, mapDispatchToProps)(Bookmark);
