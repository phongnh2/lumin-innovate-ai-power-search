/**
 * @link https://v4.mui.com/components/checkboxes/#checkbox
 */
import MaterialCheckbox from '@mui/material/Checkbox';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import CheckboxIcon from 'lumin-components/CheckboxIcon';

import { useTrackFormEvent } from 'hooks';

import { Colors } from 'constants/styles';

const useStyles = makeStyles({
  root: {
    color: Colors.NEUTRAL_20,
    '&.Mui-checked': {
      color: Colors.NEUTRAL_100,
    },
    marginLeft: (props) => props.alignLeft && -5,
  },
  checked: {},
});

const Checkbox = forwardRef((props, ref) => {
  const {
    size,
    background,
    checkedColor,
    onChange,
    dataAttribute,
    border,
    disabled,
    indeterminate,
    className,
    alignLeft,
    classes,
    ...otherProps
  } = props;
  const customClasses = useStyles({ alignLeft });
  const { trackCheckboxUpdated } = useTrackFormEvent();
  const onCheckboxChange = (e) => {
    trackCheckboxUpdated(e);
    onChange(e);
  };
  const mergedClasses = {
    ...classes,
    root: classNames(customClasses.root, classes.root),
  };

  return (
    <MaterialCheckbox
      ref={ref}
      classes={mergedClasses}
      inputProps={dataAttribute}
      disabled={disabled}
      className={className}
      icon={
        <CheckboxIcon
          size={size}
          border={border}
          disabled={disabled}
          background={background}
          checkedColor={checkedColor}
        />
      }
      indeterminate={indeterminate}
      onChange={onCheckboxChange}
      checkedIcon={<CheckboxIcon checked checkedColor={checkedColor} size={size} border={border} disabled={disabled} />}
      indeterminateIcon={
        <CheckboxIcon
          checked
          indeterminate
          checkedColor={checkedColor}
          size={size}
          border={border}
          disabled={disabled}
        />
      }
      {...otherProps}
    />
  );
});

Checkbox.propTypes = {
  size: PropTypes.number,
  background: PropTypes.string,
  checkedColor: PropTypes.string,
  onChange: PropTypes.func,
  dataAttribute: PropTypes.object,
  border: PropTypes.string,
  disabled: PropTypes.bool,
  indeterminate: PropTypes.bool,
  className: PropTypes.string,
  alignLeft: PropTypes.bool,
  classes: PropTypes.object,
};

Checkbox.defaultProps = {
  size: 20,
  checkedColor: null,
  onChange: () => {},
  dataAttribute: {},
  border: Colors.NEUTRAL_30,
  background: '',
  disabled: false,
  indeterminate: false,
  className: undefined,
  alignLeft: false,
  classes: {},
};

export default Checkbox;
