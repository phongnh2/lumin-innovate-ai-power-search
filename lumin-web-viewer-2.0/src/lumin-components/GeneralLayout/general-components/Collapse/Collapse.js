/* eslint-disable arrow-body-style */
import MuiCollapse from '@mui/material/Collapse';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import * as Styled from './Collapse.styled';

const Collapse = React.forwardRef(({ children, title }, ref) => {
  const [open, setOpen] = useState(false);

  const onClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <div ref={ref}>
      <Styled.Header component="div" onClick={onClick} $open={open}>
        <Styled.Title>{title}</Styled.Title>

        <IconButton icon="md_arrow_down" iconSize={24} />
      </Styled.Header>

      <MuiCollapse in={open} timeout="auto" unmountOnExit>
        <Styled.Container>{children}</Styled.Container>
      </MuiCollapse>
    </div>
  );
});

Collapse.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
};

export default Collapse;
