import PropTypes from 'prop-types';
import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { Colors } from 'constants/styles';

import * as Styled from './ResultCount.styled';

const ResultCount = ({ loading, searchText, total }) => {
  if (!searchText) {
    return null;
  }
  if (!loading) {
    return <Styled.ResultCount>{total} result(s)</Styled.ResultCount>;
  }
  return (
    <Styled.ResultCount>
      <Skeleton variant="rectangular" height={28} width={132} color={Colors.NEUTRAL_10} />
    </Styled.ResultCount>
  );
};

ResultCount.propTypes = {
  loading: PropTypes.bool.isRequired,
  searchText: PropTypes.string,
  total: PropTypes.number,
};

ResultCount.defaultProps = {
  searchText: '',
  total: 0,
};

export default ResultCount;
