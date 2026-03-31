import React from 'react';
import PropTypes from 'prop-types';
import Chip from 'luminComponents/Shared/Chip';
import { Colors } from 'constants/styles';
import { Plans } from 'constants/plan';

const getTagColor = (type) => {
  const defaultColors = {
    background: Colors.NEUTRAL_10,
    color: Colors.NEUTRAL_60,
  };

  switch (type.toUpperCase()) {
    case 'PREMIUM':
    case Plans.FREE_TRIAL:
    case Plans.PROMOTION:
    case Plans.PERSONAL:
    case Plans.PROFESSIONAL:
    case Plans.TEAM:
      return {
        color: Colors.WHITE,
        background: Colors.RED,
      };
    case 'ADMIN':
      return {
        color: Colors.PRIMARY_80,
        background: Colors.PRIMARY_20,
      };
    case 'FREE':
    case 'MEMBER':
    default:
      return defaultColors;
  }
};

const propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  className: '',
};

function ChipColor({ value, label, className }) {
  const style = getTagColor(value);
  return (
    <Chip
      className={className}
      backgroundColor={style.background}
      color={style.color}
      label={label}
    />
  );
}

ChipColor.propTypes = propTypes;
ChipColor.defaultProps = defaultProps;

export default ChipColor;
