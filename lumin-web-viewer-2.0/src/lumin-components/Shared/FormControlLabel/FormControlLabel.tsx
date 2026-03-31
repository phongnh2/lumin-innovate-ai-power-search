import { FormControlLabel as MuiFormControlLabel, FormControlLabelProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { merge } from 'lodash';
import React from 'react';

type IFormControlLabelProps = FormControlLabelProps;

const useStyles = makeStyles({
  root: {
    '&.Mui-disabled': {
      cursor: 'not-allowed',
    },
  },
});

const FormControlLabel = (props: IFormControlLabelProps) => {
  const { classes: classesProp, ...otherProps } = props;
  const classes = useStyles();
  return <MuiFormControlLabel {...otherProps} classes={merge({}, classes, classesProp)} />;
};

export default FormControlLabel;
