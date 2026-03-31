import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from '../ColorPalette.styled';

const ColorCell = ({ color, onClick, active, isFreeTextTool, noFill, disabled }) => (
  <Styled.ColorCell
    style={{ backgroundColor: color }}
    $isFreeTextTool={isFreeTextTool}
    onClick={() => onClick(color)}
    data-active={active}
    data-no-fill={noFill}
    data-disabled={disabled}
    role="button"
    data-cy="color_cell"
  />
);

ColorCell.propTypes = {
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  isFreeTextTool: PropTypes.bool,
  noFill: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ColorCell;
