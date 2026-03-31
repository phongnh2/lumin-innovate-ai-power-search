import { RadioGroup } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { useTrackFormEvent } from 'hooks';

import { StyledRadioWrapper, StyledRadio, StyledSubscription, useStyles } from './RadioGroup.styled';

const CustomRadioGroup = ({
  defaultValue,
  handleChange,
  radioList,
  row,
  spacing,
  customClass,
  radioSize,
  ...otherProps
}) => {
  const { trackInputChange } = useTrackFormEvent();
  const classes = useStyles();

  const onChange = (e) => {
    handleChange(e);
    trackInputChange(e);
  };
  const mergedClass = {
    ...classes,
    label: classNames(customClass.label, classes.label),
  };

  return (
    <RadioGroup value={defaultValue} onChange={onChange} row={row} {...otherProps}>
      {radioList.map((item, index) => (
        <Fragment key={index}>
          <StyledRadioWrapper
            classes={mergedClass}
            $row={row}
            spacing={spacing}
            value={item.value}
            control={<StyledRadio disabled={item.disabled} size={radioSize} />}
            label={item.label}
          />
          {item.subscription && <StyledSubscription>{item.subscription}</StyledSubscription>}
        </Fragment>
      ))}
    </RadioGroup>
  );
};

CustomRadioGroup.propTypes = {
  defaultValue: PropTypes.string,
  handleChange: PropTypes.func,
  radioList: PropTypes.array,
  row: PropTypes.bool,
  spacing: PropTypes.number,
  customClass: PropTypes.object,
  radioSize: PropTypes.number,
};
CustomRadioGroup.defaultProps = {
  defaultValue: '',
  handleChange: () => {},
  radioList: [
    {
      value: '',
      label: '',
      disabled: false,
      warningMessage: '',
    },
  ],
  row: false,
  spacing: 8,
  customClass: {},
  radioSize: 16,
};

export default CustomRadioGroup;
