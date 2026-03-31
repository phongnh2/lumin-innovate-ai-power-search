import { RadioGroup } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { useTrackFormEvent, useTabletMatch } from 'hooks';

import OrganizationTypeWarning from './OrganizationTypeWarning';
import { StyledRadioWrapper, StyledRadio, useStyles } from '../OrganizationCreate.styled';

const OrganizationTypeRadioGroup = ({ defaultValue, handleChange, radioList, organizationTypeError }) => {
  const { trackInputChange } = useTrackFormEvent();
  const classes = useStyles();
  const isTabletMatch = useTabletMatch();

  const onChange = (e) => {
    handleChange(e);
    trackInputChange(e);
  };
  const mergedClass = {
    ...classes,
    label: classNames(classes.label),
  };

  return (
    <RadioGroup
      value={defaultValue}
      onChange={onChange}
      row={isTabletMatch}
      style={isTabletMatch ? { justifyContent: 'space-between' } : {}}
    >
      {radioList.map((item, index) => (
        <Fragment key={index}>
          <StyledRadioWrapper
            classes={mergedClass}
            $row={false}
            value={item.value}
            control={<StyledRadio size={isTabletMatch ? 20 : 16} disabled={item.disabled} />}
            label={item.label}
            $disabled={item.disabled}
          />
          {!isTabletMatch && index === 0 && <OrganizationTypeWarning organizationTypeError={organizationTypeError} />}
        </Fragment>
      ))}
      {isTabletMatch && <OrganizationTypeWarning organizationTypeError={organizationTypeError} />}
    </RadioGroup>
  );
};

OrganizationTypeRadioGroup.propTypes = {
  defaultValue: PropTypes.string,
  handleChange: PropTypes.func,
  radioList: PropTypes.array,
  organizationTypeError: PropTypes.string,
};
OrganizationTypeRadioGroup.defaultProps = {
  defaultValue: '',
  handleChange: () => {},
  organizationTypeError: null,
  radioList: [
    {
      value: '',
      label: '',
      disabled: false,
      warningMessage: '',
    },
  ],
};

export default OrganizationTypeRadioGroup;
