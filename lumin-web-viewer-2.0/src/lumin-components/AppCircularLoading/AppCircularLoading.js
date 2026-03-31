import { CircularProgress } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

const AppCircularLoading = ({ noTopGap }) => (
  <div style={{ display: 'flex', justifyContent: 'center', ...(!noTopGap && { paddingTop: 120 }) }}>
    <CircularProgress />
  </div>
);

AppCircularLoading.propTypes = {
  noTopGap: PropTypes.bool,
};

AppCircularLoading.defaultProps = {
  noTopGap: false,
};

export default AppCircularLoading;
