import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './Pagination.styled';

function PaginationButton({
  active,
  ...rest
}) {
  const classes = Styled.useStyles({ active, disabled: rest.disabled });
  return (
    <Button classes={classes} {...rest} />
  );
}

PaginationButton.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
};
PaginationButton.defaultProps = {
  active: false,
  disabled: false,
};

export default PaginationButton;
