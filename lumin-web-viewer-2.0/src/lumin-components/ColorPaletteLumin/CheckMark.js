import React from 'react';
import PropTypes from 'prop-types';

import Icomoon from 'luminComponents/Icomoon';
import getBrightness from 'helpers/getBrightness';

CheckMark.propTypes = {
  color: PropTypes.object,
  bg: PropTypes.string,
};

CheckMark.defaultProps = {
  color: {},
  bg: '',
};

function CheckMark({ color, bg }) {
  const hexColor = color.toHexString();

  let isColorPicked;
  if (hexColor === null) {
    isColorPicked = bg === 'transparency';
  } else {
    isColorPicked = hexColor.toLowerCase() === bg.toLowerCase();
  }

  return isColorPicked ? (
    <Icomoon
      className={`check check-mark ${getBrightness(color)}`}
    />
  ) : null;
}

export default CheckMark;
