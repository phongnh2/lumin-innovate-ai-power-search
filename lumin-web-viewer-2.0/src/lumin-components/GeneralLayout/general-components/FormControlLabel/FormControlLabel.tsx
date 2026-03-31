import { FormControlLabel as MuiFormControlLabel, FormControlLabelProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { merge } from 'lodash';
import React from 'react';
import { useTheme } from 'styled-components';

import { typographies } from 'constants/styles/editor';

type IFormControlLabelProps = FormControlLabelProps;

const useStyles = makeStyles({
  root: ({ theme }: { theme: Record<string, string> }) => ({
    marginLeft: '-8px',
    '& .MuiFormControlLabel-label.Mui-disabled': {
      color: theme.le_main_on_surface,
      opacity: 0.6,
    },
  }),
  label: ({ theme }: { theme: Record<string, string> }) => ({
    ...typographies.le_label_medium,
    color: theme.le_main_on_surface,
  }),
});

const FormControlLabel = (props: IFormControlLabelProps) => {
  const { classes: classesProp, ...otherProps } = props;
  const theme = useTheme() as Record<string, string>;
  const classes = useStyles({ theme });
  return <MuiFormControlLabel {...otherProps} classes={merge({}, classes, classesProp)} />;
};

export default FormControlLabel;
