import PropTypes from 'prop-types';
import ActionButton from './ActionButton';

ActionButton.propTypes = {
  onClick: PropTypes.func,
};

ActionButton.defaultProps = {
  onClick: () => {},
};

export default ActionButton;
