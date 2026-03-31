import React from 'react';
import PropTypes from 'prop-types';

import {
  StyledTextLight,
  StyledRowWrapper,
} from './SearchResultItem.styled';

function NoResults({ children }) {
  return (
    <StyledRowWrapper noResults>
      <StyledTextLight>
        {children}
      </StyledTextLight>
    </StyledRowWrapper>
  );
}

NoResults.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NoResults;
