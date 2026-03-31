import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './ListSeparator.styled';

function ListSeparator(props) {
  const { selectedPage, currentPage, renderContent } = props;
  return (
    <Styled.ListSeparatorWrapper className={`ListSeparator ${selectedPage === currentPage ? 'active' : ''}`}>
      {renderContent()}
    </Styled.ListSeparatorWrapper>
  );
}

ListSeparator.propTypes = {
  selectedPage: PropTypes.number,
  currentPage: PropTypes.number,
  renderContent: PropTypes.func,
};

ListSeparator.defaultProps = {
  selectedPage: null,
  currentPage: null,
  renderContent: () => {},
};

export default ListSeparator;
