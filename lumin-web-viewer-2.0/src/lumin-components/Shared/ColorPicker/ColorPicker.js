import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { CustomPicker } from 'react-color';
import { EditableInput, Hue, Saturation } from 'react-color/lib/components/common';

import { Colors, Fonts } from 'constants/styles';

import { CustomPointer } from './components';

ColorPicker.propTypes = {
  hex: PropTypes.string,
  hsl: PropTypes.object,
  hsv: PropTypes.object,
  onChange: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ColorPicker.defaultProps = {
  onChange: () => {},
  width: 280,
  hex: undefined,
  hsl: {},
  hsv: {},
};

const customStyles = makeStyles({
  saturation: {
    position: 'relative',
    width: '100%',
    paddingBottom: '60%',
  },
  hue: {
    position: 'relative',
    width: '100%',
    height: 12,
  },
  hueContainer: {
    display: 'flex',
    margin: '8px 0',
    alignItems: 'center',
  },
  currentColor: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    marginLeft: 12,
  },
  inputWrapper: {
    '& input': {
      width: '100%',
      height: 32,
      borderRadius: 8,
      border: `1px solid ${Colors.NEUTRAL_30}`,
      padding: '0 16px',
      boxSizing: 'border-box',
      color: Colors.NEUTRAL_100,
      fontFamily: Fonts.PRIMARY,
      fontWeight: 375,
      marginBottom: 16,
      userSelect: 'all',
      pointerEvents: 'all',
    },
  },
  hex: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    display: 'block',
    marginTop: 4,
    marginBottom: 4,
    color: Colors.NEUTRAL_80,
  },
});

function ColorPicker({ hex, hsl, hsv, onChange, width }) {
  const classes = customStyles();
  return (
    <div style={{ width }}>
      <div className={classes.saturation}>
        <Saturation hsl={hsl} hsv={hsv} onChange={onChange} pointer={CustomPointer} />
      </div>
      <div className={classes.hueContainer}>
        <div className={classes.hue}>
          <Hue hsl={hsl} onChange={onChange} />
        </div>
        <div className={classes.currentColor} style={{ background: hex }} />
      </div>
      <div className={classes.inputWrapper}>
        <span className={classes.hex}>Hex</span>
        <EditableInput value={hex} onChange={onChange} />
      </div>
    </div>
  );
}

export default CustomPicker(ColorPicker);
