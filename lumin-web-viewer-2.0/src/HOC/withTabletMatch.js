import React from 'react';

import { useTabletMatch } from 'hooks';

const withTabletMatch = (Component) => (props) => {
  const isTabletUp = useTabletMatch();
  return <Component {...props} isTabletUp={isTabletUp} />;
};
export default withTabletMatch;
