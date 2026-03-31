import MaterialChip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import React from 'react';

import { Fonts } from 'constants/styles';

import { ChipSize } from './types';

import * as Styled from './Chip.styled';

Chip.propTypes = {
  label: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.node,
  font: PropTypes.shape({
    size: PropTypes.number,
    family: PropTypes.oneOf(Object.values(Fonts)),
    weight: PropTypes.number,
  }),
  size: PropTypes.oneOf(Object.values(ChipSize)),
};

Chip.defaultProps = {
  label: '',
  backgroundColor: '',
  color: '',
  className: '',
  icon: null,
  font: {},
  size: ChipSize.SM,
};

function Chip(props) {
  const { label, backgroundColor, color, className, font, icon, size } = props;
  const classes = Styled.useStyles({
    backgroundColor,
    color,
    font,
    size,
    hasIcon: Boolean(icon),
  });
  return <MaterialChip className={className} icon={icon} classes={classes} label={label} component="span" />;
}

export default Chip;
