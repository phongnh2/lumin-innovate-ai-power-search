import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './Pagination.styled';

const Pagination = ({ totalPage, currentPage }) => (
  <Styled.Container>
    {currentPage}/{totalPage}
  </Styled.Container>
);

Pagination.propTypes = {
  totalPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
