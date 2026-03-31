import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

const withLoadAWSPinpoint = (Component) => (props) => {
  const hasPinpointLoaded = useSelector(selectors.hasPinpointLoaded);

  return <Component {...props} hasPinpointLoaded={hasPinpointLoaded} />;
};

export default withLoadAWSPinpoint;
