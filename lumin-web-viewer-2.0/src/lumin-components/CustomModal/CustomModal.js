import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import Dialog from 'luminComponents/Dialog';

import './CustomModal.scss';

const CustomModal = ({ children, ...props }) => {
  const useStyles = makeStyles((theme) => ({
    paperScrollBody: {
      maxWidth: 930,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        maxWidth: 'none',
      },
    },
  }));
  const classes = useStyles();

  return (
    <Dialog
      classes={{
        paperScrollBody: classes.paperScrollBody,
      }}
      {...props}

    >
      <div className="CustomModal__wrapper">
        {children}
      </div>
    </Dialog>
  );
};
CustomModal.propTypes = {
  children: PropTypes.node,
};

CustomModal.defaultProps = {
  children: null,
};

export default CustomModal;
