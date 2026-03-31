import React from 'react';

import withRouter from 'HOC/withRouter';

const withRouterRef = (Component) => {
  const WithRouter = withRouter(({ forwardedRef, ...props }) => (
    <Component ref={forwardedRef} {...props} />
  ));

  return React.forwardRef((props, ref) => (
    <WithRouter {...props} forwardedRef={ref} />
  ));
};

export default withRouterRef;
