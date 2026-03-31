import React from 'react';
import PropTypes from 'prop-types';

import './OverlayItem.scss';

const defaultProps = {
  onClick: () => {},
  buttonName: '',
};

const propTypes = {
  onClick: PropTypes.func,
  buttonName: PropTypes.string,
};

class OverlayItem extends React.PureComponent {
  render() {
    const { buttonName } = this.props;
    return (
      <div className="OverlayItem" onClick={this.props.onClick}>
        <div className="ButtonText">
          { buttonName }
        </div>
      </div>
    );
  }
}

OverlayItem.propTypes = propTypes;
OverlayItem.defaultProps = defaultProps;

export default OverlayItem;
