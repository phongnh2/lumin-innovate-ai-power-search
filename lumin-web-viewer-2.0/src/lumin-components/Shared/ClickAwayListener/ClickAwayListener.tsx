import MuiClickAwayListener, { ClickAwayListenerProps as BaseProps } from '@mui/material/ClickAwayListener';
import React from 'react';

type ClickAwayListenerProps = BaseProps;

const ClickAwayListener = (props: ClickAwayListenerProps) => <MuiClickAwayListener {...props} />;

export default ClickAwayListener;
